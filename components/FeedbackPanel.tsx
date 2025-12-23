import React from 'react';
import { PronunciationFeedback } from '../types';

interface FeedbackPanelProps {
  feedback: PronunciationFeedback | null;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback }) => {
  if (!feedback) {
    return (
      <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-retro-gray-dark bg-retro-black/50 p-6">
        <div className="text-center opacity-50">
          <div className="animate-pulse mb-2 text-retro-orange text-2xl">●</div>
          <div className="font-term tracking-widest text-xs text-retro-gray">AWAITING AUDIO INPUT</div>
        </div>
      </div>
    );
  }

  // Determine color based on score
  const scoreColor = feedback.score >= 80 ? 'bg-retro-orange' : feedback.score >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  const scoreText = feedback.score >= 80 ? 'OPTIMAL' : feedback.score >= 50 ? 'SUB-OPTIMAL' : 'CRITICAL';

  return (
    <div className="w-full bg-retro-black border-2 border-retro-gray relative overflow-hidden group shadow-[4px_4px_0px_#15853D] animate-flicker">
        
      {/* Header */}
      <div className="bg-retro-gray-dark text-retro-gray px-3 py-1 text-xs font-bold tracking-widest uppercase border-b border-retro-gray flex justify-between items-center">
        <span className="text-glow">DIAGNOSTIC_REPORT</span>
        <span className="text-retro-orange animate-pulse">LIVE</span>
      </div>

      <div className="p-4 space-y-4 relative">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(29,185,84,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(29,185,84,0.05)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>

        {/* Score Section */}
        <div>
            <div className="flex justify-between text-xs font-term text-retro-gray mb-1">
                <span>PRONUNCIATION_INTEGRITY</span>
                <span>{feedback.score}%</span>
            </div>
            <div className="h-4 w-full bg-retro-gray-dark border border-retro-gray relative">
                <div 
                    className={`h-full ${scoreColor} transition-all duration-1000 ease-out`} 
                    style={{ width: `${feedback.score}%` }}
                ></div>
                {/* Tick marks */}
                <div className="absolute inset-0 flex justify-between px-1">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="w-[1px] h-full bg-black/30"></div>
                    ))}
                </div>
            </div>
            <div className="text-right text-[10px] text-retro-gray mt-1 font-term tracking-wider">{scoreText}</div>
        </div>

        {/* Issues Section */}
        {(feedback.words.length > 0 || feedback.phonemes.length > 0) && (
            <div className="border border-retro-gray/50 p-2 bg-retro-surface/50">
                <div className="text-[10px] text-retro-orange uppercase mb-2 border-b border-retro-gray/30 pb-1 flex justify-between">
                    <span>Detected Anomalies</span>
                    <span>ERR_COUNT: {feedback.words.length + feedback.phonemes.length}</span>
                </div>
                
                {/* Words */}
                {feedback.words.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {feedback.words.map((word, i) => (
                            <span key={i} className="text-sm font-term text-retro-gray px-1 bg-red-900/30 border border-red-900/50">
                                "{word}"
                            </span>
                        ))}
                    </div>
                )}
                
                {/* Phonemes */}
                {feedback.phonemes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {feedback.phonemes.map((pho, i) => (
                             <div key={i} className="flex flex-col items-center">
                                <span className="text-[10px] text-retro-gray-dark bg-retro-gray px-1 font-bold">IPA</span>
                                <span className="text-sm font-term text-retro-orange border border-retro-gray/30 px-1 bg-black">
                                    /{pho}/
                                </span>
                             </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* Feedback Section */}
        <div>
            <div className="text-[10px] text-retro-orange uppercase mb-1">> CORRECTION_ALGORITHM</div>
            <div className="font-term text-sm text-retro-gray leading-tight">
                {feedback.feedback}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPanel;