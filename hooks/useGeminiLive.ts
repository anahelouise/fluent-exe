import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { ConnectionState, Message, Topic, PronunciationFeedback } from '../types';
import { createPcmBlob, decodeBase64, decodeAudioData, downsampleBuffer } from '../utils/audioUtils';

interface UseGeminiLiveProps {
  topic: Topic;
}

const FEEDBACK_TOOL: FunctionDeclaration = {
  name: 'provide_feedback',
  description: 'Provide pronunciation analysis and feedback on the user\'s last spoken sentence.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      score: {
        type: Type.INTEGER,
        description: 'Pronunciation score from 0 to 100.',
      },
      mispronounced_words: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'List of specific words that were mispronounced or unclear.',
      },
      mispronounced_phonemes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'List of specific IPA phonemes (e.g. /r/, /th/, /æ/) that were not articulated correctly.',
      },
      suggestion: {
        type: Type.STRING,
        description: 'Brief, actionable advice on intonation, stress, or specific sounds to improve.',
      },
    },
    required: ['score', 'mispronounced_words', 'mispronounced_phonemes', 'suggestion'],
  },
};

export const useGeminiLive = ({ topic }: UseGeminiLiveProps) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [messages, setMessages] = useState<Message[]>([]);
  const [volume, setVolume] = useState<number>(0);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<PronunciationFeedback | null>(null);
  
  // Refs for audio handling to avoid re-renders
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isStreamActiveRef = useRef<boolean>(false);
  
  // Transcription accumulators
  const currentInputTranscriptionRef = useRef<string>('');
  const currentOutputTranscriptionRef = useRef<string>('');
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const disconnect = useCallback(() => {
    isStreamActiveRef.current = false;

    // 1. Close session if possible (wrapper cleanup)
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => {
            try {
                session.close();
            } catch (e) {
                console.warn("Error closing session:", e);
            }
        });
        sessionPromiseRef.current = null;
    }

    // 2. Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // 3. Disconnect audio nodes
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    // 4. Close audio contexts
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    // 5. Stop all playing audio
    scheduledSourcesRef.current.forEach(source => {
        try {
            source.stop();
        } catch(e) { /* ignore */ }
    });
    scheduledSourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    setConnectionState(ConnectionState.DISCONNECTED);
    setVolume(0);
    setPronunciationFeedback(null);
  }, []);

  const connect = useCallback(async () => {
    if (connectionState === ConnectionState.CONNECTED || connectionState === ConnectionState.CONNECTING) return;

    setConnectionState(ConnectionState.CONNECTING);
    setMessages([]);
    setPronunciationFeedback(null);
    isStreamActiveRef.current = true;

    try {
      // Initialize Audio Contexts
      // Input: Try to get 16kHz to match Gemini's preferred rate
      const InputContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const inputCtx = new InputContextClass({ sampleRate: 16000 });
      inputAudioContextRef.current = inputCtx;

      // Output: 24kHz as typically returned by Gemini Live
      const OutputContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const outputCtx = new OutputContextClass({ sampleRate: 24000 });
      outputAudioContextRef.current = outputCtx;

      // Request Microphone Access with constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000
        } 
      });
      streamRef.current = stream;

      // Initialize Gemini API
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `You are a friendly, patient, and world-class English language tutor. 
      The user is here to practice English. 
      Current practice topic: "${topic}".
      Speak clearly and at a moderate pace. 
      
      IMPORTANT: You must analyze the user's pronunciation and intonation for every turn.
      Call the 'provide_feedback' tool to report:
      1. The pronunciation score (0-100).
      2. Any mispronounced words.
      3. SPECIFIC IPA PHONEMES that were incorrect (e.g., /r/, /v/, /θ/).
      4. A brief suggestion.
      
      Do this regardless of whether the pronunciation was good or bad.
      Then, respond verbally to the user to continue the conversation naturally.`;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          tools: [{ functionDeclarations: [FEEDBACK_TOOL] }],
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: { parts: [{ text: systemInstruction }]},
          inputAudioTranscription: {}, // Enable input transcription
          outputAudioTranscription: {}, // Enable output transcription
        },
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Session Opened");
            setConnectionState(ConnectionState.CONNECTED);
            
            // Setup Audio Processing (Mic -> Model)
            const source = inputCtx.createMediaStreamSource(stream);
            inputSourceRef.current = source;
            
            // 4096 buffer size, 1 input channel, 1 output channel
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              if (!isStreamActiveRef.current) return;

              const inputData = e.inputBuffer.getChannelData(0);
              
              // Simple volume meter logic
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(rms * 5, 1)); // Boost visual a bit

              // Downsample to 16000Hz if necessary
              const downsampledData = downsampleBuffer(inputData, inputCtx.sampleRate, 16000);

              // Create PCM blob and send to model
              const pcmBlob = createPcmBlob(downsampledData, 16000);
              
              sessionPromiseRef.current?.then((session) => {
                  if (!isStreamActiveRef.current) return;
                  try {
                    session.sendRealtimeInput({ media: pcmBlob });
                  } catch (e) {
                    console.error("Error sending input:", e);
                  }
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Tool Calls (Pronunciation Feedback)
            if (msg.toolCall) {
                for (const fc of msg.toolCall.functionCalls) {
                    if (fc.name === 'provide_feedback') {
                        const args = fc.args as any;
                        setPronunciationFeedback({
                            score: args.score,
                            words: args.mispronounced_words || [],
                            phonemes: args.mispronounced_phonemes || [],
                            feedback: args.suggestion
                        });

                        // Send tool response to allow model to continue
                        sessionPromiseRef.current?.then(session => {
                            if (!isStreamActiveRef.current) return;
                            session.sendToolResponse({
                                functionResponses: [{
                                    id: fc.id,
                                    name: fc.name,
                                    response: { result: "ok" }
                                }]
                            });
                        });
                    }
                }
            }

            // Handle Transcriptions
            const outputTx = msg.serverContent?.outputTranscription;
            const inputTx = msg.serverContent?.inputTranscription;

            if (outputTx?.text) {
                currentOutputTranscriptionRef.current += outputTx.text;
            }
            if (inputTx?.text) {
                currentInputTranscriptionRef.current += inputTx.text;
            }

            // Handle Turn Complete (finalize message)
            if (msg.serverContent?.turnComplete) {
                const userText = currentInputTranscriptionRef.current.trim();
                const modelText = currentOutputTranscriptionRef.current.trim();
                
                if (userText) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString() + '-user',
                        role: 'user',
                        text: userText,
                        timestamp: new Date()
                    }]);
                }
                
                if (modelText) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString() + '-model',
                        role: 'model',
                        text: modelText,
                        timestamp: new Date()
                    }]);
                }

                currentInputTranscriptionRef.current = '';
                currentOutputTranscriptionRef.current = '';
            }

            // Handle Audio Output
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
                const ctx = outputAudioContextRef.current;
                const rawBytes = decodeBase64(audioData);
                const audioBuffer = await decodeAudioData(rawBytes, ctx, 24000, 1);
                
                // Scheduling
                // Ensure we schedule after the current time or after the last scheduled chunk
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                const gainNode = ctx.createGain(); // For model volume if needed
                gainNode.gain.value = 1.0;
                
                source.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                
                scheduledSourcesRef.current.add(source);
                source.onended = () => {
                    scheduledSourcesRef.current.delete(source);
                };
            }

            // Handle Interruption
            if (msg.serverContent?.interrupted) {
                console.log("Interrupted!");
                scheduledSourcesRef.current.forEach(s => s.stop());
                scheduledSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                currentOutputTranscriptionRef.current = ''; // Clear stale transcription
            }
          },
          onclose: () => {
            console.log("Session closed");
            setConnectionState(ConnectionState.DISCONNECTED);
          },
          onerror: (err) => {
            console.error("Gemini Live Error:", err);
            setConnectionState(ConnectionState.ERROR);
            disconnect();
          }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (error) {
      console.error("Connection failed", error);
      setConnectionState(ConnectionState.ERROR);
    }
  }, [topic, connectionState, disconnect]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    connectionState,
    messages,
    volume,
    pronunciationFeedback
  };
};