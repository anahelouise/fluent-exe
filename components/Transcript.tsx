import React, { useEffect, useRef } from 'react';
import { Message } from '../types';

interface TranscriptProps {
  messages: Message[];
}

const Transcript: React.FC<TranscriptProps> = ({ messages }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-retro-gray/40 text-xl font-term animate-pulse">
        > AWAITING VOICE INPUT...
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 p-6 font-term text-lg">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div className={`
            max-w-[90%] p-3 border-2 text-glow
            ${msg.role === 'user' 
              ? 'border-retro-orange text-retro-orange bg-retro-orange/5 shadow-[4px_4px_0px_rgba(21,133,61,0.4)]' 
              : 'border-retro-gray text-retro-gray bg-retro-gray-dark/30 shadow-[4px_4px_0px_rgba(80,80,80,0.4)]'}
          `}>
            <span className="text-xs opacity-70 mb-1 block uppercase tracking-widest border-b border-current pb-1 mb-2 font-bold">
                {msg.role === 'user' ? '>> OPERATOR' : '>> SYSTEM'}
            </span>
            {msg.text}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

export default Transcript;