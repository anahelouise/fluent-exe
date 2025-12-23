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
      
      {/* Scope Housing */}
      <div className="absolute inset-0 rounded-full border-4 border-retro-gray-dark bg-black shadow-[0_0_50px_rgba(29,185,84,0.15)] overflow-hidden">
        
        {/* CRT Scanline Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(transparent 50%, rgba(0,0,0,0.5) 50%)',
               backgroundSize: '100% 4px' 
             }}>
        </div>
        
        {/* Grid */}
        <div className="absolute inset-0 opacity-20" 
             style={{ 
               backgroundImage: 'linear-gradient(#15853D 1px, transparent 1px), linear-gradient(90deg, #15853D 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }}>
        </div>

        {/* Static Axis Lines */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-retro-gray/30 z-0"></div>
        <div className="absolute left-1/2 top-0 h-full w-[1px] bg-retro-gray/30 z-0"></div>

        {/* Vignette */}
        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_60px_rgba(0,0,0,0.9)] pointer-events-none z-30"></div>

        {isActive ? (
          <div className="absolute inset-0 flex items-center justify-center z-20">
             <svg viewBox="0 0 200 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(29,185,84,0.6)]">
                
                {/* Wave 1: Primary Green (Stable) */}
                <path 
                  d="M0,50 Q25,20 50,50 T100,50 T150,50 T200,50" 
                  fill="none" 
                  stroke="#15853D" 
                  strokeWidth="2" 
                  className="opacity-70"
                  style={{ 
                    transformOrigin: 'center',
                    transform: `scaleY(${1 + v * 4})` 
                  }}
                />

                {/* Wave 2: Bright Green (Reactive) */}
                <path 
                  d="M0,50 Q20,80 40,50 T80,50 T120,50 T160,50 T200,50" 
                  fill="none" 
                  stroke="#1DB954" 
                  strokeWidth="2"
                  style={{ 
                    transformOrigin: 'center',
                    transform: `scaleY(${0.5 + v * 10}) translateX(${-v * 10}px)` 
                  }}
                />

                {/* Wave 3: White Hot (High Intensity) */}
                <path 
                  d="M0,50 Q10,30 20,50 T40,50 T60,50 T80,50 T100,50 T120,50 T140,50 T160,50 T180,50 T200,50" 
                  fill="none" 
                  stroke="#FFFFFF" 
                  strokeWidth="1.5"
                  className="opacity-90"
                  style={{ 
                    transformOrigin: 'center',
                    transform: `scaleY(${0.2 + v * 15})` 
                  }}
                />
             </svg>
             
             {/* Digital Noise Overlay on high volume */}
             {v > 0.4 && (
                <div className="absolute inset-0 bg-retro-orange/10 mix-blend-overlay animate-pulse"></div>
             )}
          </div>
        ) : (
          /* Idle State: Flat Line */
          <div className="absolute inset-0 flex items-center justify-center z-20">
             <div className="w-full h-[2px] bg-retro-gray/40 shadow-[0_0_10px_rgba(29,185,84,0.5)]"></div>
          </div>
        )}

      </div>
      
      {/* External Markers */}
      <div className="absolute -inset-4 border border-retro-gray/20 rounded-full pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 text-[8px] font-term text-retro-gray bg-black px-1">CH-1</div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-1 text-[8px] font-term text-retro-gray bg-black px-1">OSC</div>

    </div>
  );
};

export default Visualizer;