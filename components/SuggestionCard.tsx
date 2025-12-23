import React from 'react';
import { Topic } from '../types';

interface SuggestionCardProps {
  topic: Topic;
}

const SUGGESTIONS: Record<Topic, string[]> = {
  [Topic.FREE_TALK]: [
    "Hello, how are you doing today?",
    "Could you tell me a short story?",
    "What is the weather like in your area?",
    "I'm trying to improve my English fluency."
  ],
  [Topic.BUSINESS]: [
    "I would like to schedule a follow-up meeting.",
    "Can we review the quarterly performance report?",
    "Please send me the agenda for tomorrow.",
    "That sounds like a viable strategic plan."
  ],
  [Topic.TRAVEL]: [
    "Excuse me, where is the nearest train station?",
    "I have a hotel reservation under the name Smith.",
    "How much does a ticket to the city center cost?",
    "Could you help me carry these bags?"
  ],
  [Topic.RESTAURANT]: [
    "I would like to see the dinner menu, please.",
    "Do you have any vegetarian options available?",
    "Could we get the check, please?",
    "I have a severe peanut allergy."
  ],
  [Topic.JOB_INTERVIEW]: [
    "Can you describe the company culture here?",
    "My greatest strength is my problem-solving ability.",
    "I enjoy working collaboratively in a team.",
    "What are the next steps in the hiring process?"
  ],
};

const SuggestionCard: React.FC<SuggestionCardProps> = ({ topic }) => {
  const suggestions = SUGGESTIONS[topic];

  return (
    <div className="w-full bg-retro-black border-2 border-retro-gray-dark relative overflow-hidden group shadow-lg">
      {/* Header */}
      <div className="bg-retro-gray-dark text-retro-gray px-3 py-2 text-xs font-bold tracking-widest uppercase border-b border-retro-gray flex justify-between items-center">
        <span className="text-glow">HINT_MODULE.DAT</span>
        <div className="flex space-x-1">
             <span className="w-1 h-1 bg-retro-gray rounded-full"></span>
             <span className="w-1 h-1 bg-retro-gray rounded-full"></span>
             <span className="w-1 h-1 bg-retro-orange animate-pulse"></span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 relative bg-retro-surface/30">
         {/* Scanline overlay for this card */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
         
         <div className="space-y-3 relative z-10">
           {suggestions.map((suggestion, index) => (
             <div key={index} className="flex items-start space-x-3 text-retro-gray hover:text-retro-orange transition-colors cursor-default text-sm font-term group/item">
               <span className="text-retro-orange opacity-50 font-retro text-[10px] pt-1 group-hover/item:opacity-100">></span>
               <span className="tracking-wide border-b border-transparent group-hover/item:border-retro-orange/30 pb-0.5">{suggestion}</span>
             </div>
           ))}
         </div>
      </div>
      
      {/* Decorative Corner */}
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-retro-orange opacity-50"></div>
    </div>
  );
};

export default SuggestionCard;