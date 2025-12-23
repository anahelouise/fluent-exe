import React from 'react';

interface VisualizerProps {
  isActive: boolean;
  volume: number; // 0 to 1
}

const Visualizer: React.FC<VisualizerProps> = ({ isActive, volume }) => {
  // Normalize volume
  const v = Math.max(0, Math.min(1, volume));
  
  return (
    <div className="relative w-72 h-72 flex items-center justify-center">
      
      {/* Housing */}
      <div className="absolute inset-0 rounded-full border-4 border-retro-gray-dark bg-black shadow-[0_0_50px_rgba(29,185,84,0.15)] overflow-hidden relative">
        
        {/* Scanlines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-50" 
             style={{ 
               backgroundImage: 'linear-gradient(transparent 50%, rgba(0,0,0,0.5) 50%)',
               backgroundSize: '100% 4px' 
             }}>
        </div>
        
        {/* Vignette */}
        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_60px_rgba(0,0,0,0.9)] pointer-events-none z-50"></div>

        {/* --- RADAR LAYERS --- */}

        {/* 1. The Grid (Fixed) */}
        <div className="absolute inset-0 z-20 opacity-40">
           <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Main Crosshair */}
              <line x1="100" y1="0" x2="100" y2="200" stroke="#15853D" strokeWidth="1" />
              <line x1="0" y1="100" x2="200" y2="100" stroke="#15853D" strokeWidth="1" />
              
              {/* Concentric Rings */}
              <circle cx="100" cy="100" r="90" stroke="#15853D" strokeWidth="1" fill="none" strokeDasharray="4 4" />
              <circle cx="100" cy="100" r="60" stroke="#15853D" strokeWidth="1" fill="none" />
              <circle cx="100" cy="100" r="30" stroke="#15853D" strokeWidth="1" fill="none" strokeDasharray="2 2" />
           </svg>
        </div>

        {/* 2. The Sweep (Rotating) */}
        <div className={`absolute inset-0 z-10 ${isActive ? 'animate-[spin_3s_linear_infinite]' : 'opacity-0 transition-opacity duration-500'}`}>
           <div className="w-full h-full rounded-full" 
                style={{ background: 'conic-gradient(from 0deg, transparent 0deg, transparent 240deg, rgba(29, 185, 84, 0.4) 360deg)' }}>
           </div>
        </div>

        {/* 3. The Object / Volume Reactivity (Center) */}
        <div className="absolute inset-0 z-30 flex items-center justify-center">
            {/* Central Dot */}
            <div className={`rounded-full bg-retro-orange transition-all duration-75 ease-out shadow-[0_0_15px_#1DB954]
                            ${isActive ? 'opacity-100' : 'opacity-20'}`}
                 style={{
                   width: isActive ? `${10 + v * 60}px` : '8px',
                   height: isActive ? `${10 + v * 60}px` : '8px',
                 }}
            />
            
            {/* Echo Ring based on volume */}
            {isActive && v > 0.05 && (
               <div className="absolute rounded-full border border-retro-orange/60 animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite]"
                    style={{ 
                        width: `${20 + v * 100}%`, 
                        height: `${20 + v * 100}%` 
                    }}
               ></div>
            )}
        </div>

      </div>
      
      {/* Labels */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 bg-black px-2 text-[10px] text-retro-gray font-term border border-retro-gray-dark tracking-widest">
        RADAR_LINK
      </div>
      
      {/* Dynamic degree markers */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-2 text-[8px] text-retro-gray font-term -translate-y-1/2">270°</div>
          <div className="absolute top-1/2 right-2 text-[8px] text-retro-gray font-term -translate-y-1/2">90°</div>
          <div className="absolute top-2 left-1/2 text-[8px] text-retro-gray font-term -translate-x-1/2">0°</div>
          <div className="absolute bottom-2 left-1/2 text-[8px] text-retro-gray font-term -translate-x-1/2">180°</div>
      </div>

    </div>
  );
};

export default Visualizer;