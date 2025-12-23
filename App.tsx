import React, { useState } from 'react';
import { useGeminiLive } from './hooks/useGeminiLive';
import Visualizer from './components/Visualizer';
import Transcript from './components/Transcript';
import SuggestionCard from './components/SuggestionCard';
import FeedbackPanel from './components/FeedbackPanel';
import { Topic, ConnectionState } from './types';

const TOPIC_DESCRIPTIONS: Record<Topic, string> = {
  [Topic.FREE_TALK]: "UNRESTRICTED_INPUT",
  [Topic.BUSINESS]: "CORPORATE_PROTOCOLS",
  [Topic.TRAVEL]: "NAVIGATION_DATA",
  [Topic.RESTAURANT]: "RATION_ACQUISITION",
  [Topic.JOB_INTERVIEW]: "EVALUATION_MODE",
};

const App: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic>(Topic.FREE_TALK);
  const { 
    connect, 
    disconnect, 
    connectionState, 
    messages, 
    volume,
    pronunciationFeedback
  } = useGeminiLive({ topic: selectedTopic });

  const isActive = connectionState === ConnectionState.CONNECTED;
  const isConnecting = connectionState === ConnectionState.CONNECTING;

  const handleToggleConnection = () => {
    if (isActive || isConnecting) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 font-term selection:bg-retro-orange selection:text-black">
      
      {/* Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center mb-10 border-b-4 border-retro-gray pb-4 bg-retro-black/80 backdrop-blur-md px-6 py-4">
        <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-retro-orange text-black flex items-center justify-center font-retro text-2xl border-2 border-retro-orange shadow-[2px_2px_0px_#555]">
                F
            </div>
            <div>
                <h1 className="text-4xl md:text-5xl font-retro text-retro-gray tracking-tighter uppercase text-glow">
                    FLUENT<span className="text-retro-orange">.EXE</span>
                </h1>
                <p className="text-retro-gray-dark text-sm tracking-[0.3em] font-bold bg-retro-gray px-1">SYSTEM_V2.5</p>
            </div>
        </div>
        
        <div className={`mt-4 md:mt-0 px-6 py-2 border-2 text-xl font-bold tracking-widest text-glow ${
            isActive 
            ? 'border-retro-orange text-retro-orange animate-pulse bg-retro-orange/10' 
            : 'border-retro-gray text-retro-gray opacity-60'
        }`}>
            {isActive ? '● TRANSMITTING' : '○ OFFLINE'}
        </div>
      </header>

      <main className="w-full max-w-6xl flex-1 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* Left Panel: Interface */}
        <div className="flex-1 flex flex-col bg-retro-black border-4 border-retro-gray-dark p-1 relative overflow-hidden shadow-2xl min-h-[600px]">
            {/* Decorative Industrial Screws */}
            <div className="absolute top-2 left-2 w-3 h-3 bg-retro-gray-dark rounded-full border border-gray-600 flex items-center justify-center"><div className="w-full h-[1px] bg-gray-600 rotate-45"></div></div>
            <div className="absolute top-2 right-2 w-3 h-3 bg-retro-gray-dark rounded-full border border-gray-600 flex items-center justify-center"><div className="w-full h-[1px] bg-gray-600 rotate-45"></div></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 bg-retro-gray-dark rounded-full border border-gray-600 flex items-center justify-center"><div className="w-full h-[1px] bg-gray-600 rotate-45"></div></div>
            <div className="absolute bottom-2 right-2 w-3 h-3 bg-retro-gray-dark rounded-full border border-gray-600 flex items-center justify-center"><div className="w-full h-[1px] bg-gray-600 rotate-45"></div></div>

            <div className="border border-retro-gray-dark h-full p-6 md:p-10 flex flex-col bg-retro-surface/50">
                
                {/* Visualizer Area */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-retro-gray-dark bg-black mb-8 relative animate-flicker">
                     {/* Vignette & Scanline Overlay */}
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(0,0,0,0.6)_100%)] pointer-events-none z-10"></div>
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>
                     
                    <Visualizer isActive={isActive} volume={volume} />
                    
                    <p className="mt-8 text-2xl font-term text-retro-orange tracking-widest uppercase animate-pulse text-glow z-20">
                        {isActive 
                            ? ">> VOICE DETECTED..." 
                            : isConnecting 
                                ? ">> ESTABLISHING LINK..." 
                                : ">> SYSTEM READY"}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-6 w-full">
                     {/* Topic Selector - Industrial Menu (Shows when disconnected) */}
                    {!isActive && !isConnecting && (
                        <div className="w-full">
                            <label className="block text-retro-gray font-retro text-xs mb-4 text-center">SELECT MODULE:</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.values(Topic).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setSelectedTopic(t)}
                                        className={`
                                            px-2 py-3 border-2 font-term text-xl transition-all duration-75 uppercase
                                            ${selectedTopic === t 
                                                ? 'bg-retro-orange border-retro-orange text-black font-bold shadow-[4px_4px_0px_#333]' 
                                                : 'bg-retro-black border-retro-gray text-retro-gray hover:bg-retro-gray-dark hover:text-white'}
                                        `}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 text-center text-retro-orange font-term border border-retro-orange/30 bg-retro-orange/5 py-2 text-glow">
                                <span className="mr-2 text-retro-gray">MISSION:</span>
                                {TOPIC_DESCRIPTIONS[selectedTopic]}
                            </div>
                        </div>
                    )}

                    {/* Feedback Panel (Shows when connected) */}
                    {(isActive || isConnecting) && (
                        <div className="w-full">
                            <FeedbackPanel feedback={pronunciationFeedback} />
                        </div>
                    )}

                    {/* Big Industrial Button */}
                    <button
                        onClick={handleToggleConnection}
                        disabled={isConnecting}
                        className={`
                            group relative px-10 py-6 font-retro text-xl uppercase tracking-wider w-full md:w-auto
                            border-2 transition-all mt-4
                            ${isActive 
                                ? 'bg-retro-gray-dark text-retro-gray border-retro-gray hover:text-white hover:border-white' 
                                : 'bg-retro-orange text-black border-retro-orange hover:bg-retro-orange-dim shadow-[0_0_15px_rgba(29,185,84,0.4)]'}
                        `}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            {isConnecting ? "[ INITIALIZING ]" : isActive ? "[ TERMINATE ]" : "[ EXECUTE ]"}
                        </span>
                    </button>
                    
                    {connectionState === ConnectionState.ERROR && (
                        <div className="w-full text-center border-2 border-retro-orange text-retro-orange bg-retro-orange/10 p-2 font-term animate-pulse text-glow">
                            !! HARDWARE ERROR !! CHECK INPUT DEVICE
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Panel: Wrapper for Monitor and Suggestions */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
            
            {/* Monitor */}
            <div className="flex flex-col h-[500px] lg:h-[600px] bg-retro-black border-4 border-retro-gray rounded-lg relative shadow-xl">
                {/* Monitor Header */}
                <div className="bg-retro-gray text-black px-4 py-1 text-center font-bold text-xs tracking-widest uppercase border-b-2 border-black">
                    TERMINAL OUTPUT 001
                </div>

                <div className="flex-1 bg-black overflow-hidden relative m-2 border-2 border-retro-gray-dark animate-flicker">
                    {/* Screen inner shadow & Vignette */}
                    <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,1)] pointer-events-none z-20"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_60%,_rgba(0,0,0,0.5)_100%)] pointer-events-none z-15"></div>
                    
                    <div className="absolute top-0 left-0 right-0 bg-retro-gray-dark/50 p-2 border-b border-retro-gray-dark z-10 backdrop-blur-sm flex justify-between">
                        <span className="font-term text-retro-gray text-lg text-glow">> LOG_FILE.DAT</span>
                        <span className="w-3 h-3 bg-retro-orange rounded-full animate-pulse shadow-[0_0_5px_#1DB954]"></span>
                    </div>

                    <div className="h-full overflow-y-auto pt-12 pb-4 px-2 relative z-0 scrollbar-thin scrollbar-thumb-retro-orange scrollbar-track-retro-black">
                        <Transcript messages={messages} />
                    </div>
                </div>
            </div>

            {/* Suggestions Card */}
            <SuggestionCard topic={selectedTopic} />
            
        </div>
      </main>

      <footer className="w-full text-center py-6 text-retro-gray-dark text-sm font-term mt-8 tracking-widest z-10">
        © 198X FLUENT SYSTEMS. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
};

export default App;