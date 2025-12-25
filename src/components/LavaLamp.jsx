/**
 * LavaLamp.jsx
 * 
 * Hyper-realistic water splash effect with CSS animations.
 * One central water bubble with droplets splashing around it.
 * Colors match the purple lotus logo.
 */

import { useEffect, useState } from 'react'

function LavaLamp() {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mediaQuery.matches)
    const handleChange = (e) => setReduceMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <div className="water-splash-container" aria-hidden="true">
      {/* SVG Filter for gooey liquid merge effect */}
      <svg className="svg-filters">
        <defs>
          <filter id="goo-water">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  
                      0 1 0 0 0  
                      0 0 1 0 0  
                      0 0 0 25 -10"
            />
          </filter>
        </defs>
      </svg>

      {/* Liquid layer with gooey filter */}
      <div 
        className="liquid-layer"
        style={{ 
          filter: 'url(#goo-water)',
          animationPlayState: reduceMotion ? 'paused' : 'running'
        }}
      >
        {/* Main water bubble */}
        <div 
          className="main-bubble"
          style={{ animationPlayState: reduceMotion ? 'paused' : 'running' }}
        />
        
        {/* Splashing droplets */}
        <div className="droplet drop-1" style={{ animationPlayState: reduceMotion ? 'paused' : 'running' }} />
        <div className="droplet drop-2" style={{ animationPlayState: reduceMotion ? 'paused' : 'running' }} />
        <div className="droplet drop-3" style={{ animationPlayState: reduceMotion ? 'paused' : 'running' }} />
        <div className="droplet drop-4" style={{ animationPlayState: reduceMotion ? 'paused' : 'running' }} />
        <div className="droplet drop-5" style={{ animationPlayState: reduceMotion ? 'paused' : 'running' }} />
        <div className="droplet drop-6" style={{ animationPlayState: reduceMotion ? 'paused' : 'running' }} />
        <div className="droplet drop-7" style={{ animationPlayState: reduceMotion ? 'paused' : 'running' }} />
        <div className="droplet drop-8" style={{ animationPlayState: reduceMotion ? 'paused' : 'running' }} />
      </div>

      {/* Highlight overlay - crisp specular reflections */}
      <div className="highlight-overlay">
        <div className="shine shine-1" style={{ animationPlayState: reduceMotion ? 'paused' : 'running' }} />
        <div className="shine shine-2" style={{ animationPlayState: reduceMotion ? 'paused' : 'running' }} />
        <div className="shine shine-3" style={{ animationPlayState: reduceMotion ? 'paused' : 'running' }} />
      </div>

      <style>{`
        .water-splash-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }

        .svg-filters {
          position: absolute;
          width: 0;
          height: 0;
        }

        .liquid-layer {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 500px;
        }

        /* ========================================
           Main Water Bubble - Centered
           Purple/Lavender tones matching the lotus logo
           ======================================== */
        .main-bubble {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 180px;
          height: 180px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: 
            /* Primary specular - intense white hotspot like real water */
            radial-gradient(ellipse 22% 16% at 28% 25%, 
              rgba(255,255,255,1) 0%, 
              rgba(255,255,255,0.97) 15%,
              rgba(255,255,255,0.7) 35%,
              rgba(255,255,255,0.2) 55%,
              transparent 70%
            ),
            /* Secondary specular - softer catchlight */
            radial-gradient(ellipse 12% 8% at 40% 30%, 
              rgba(255,255,255,0.9) 0%, 
              rgba(255,255,255,0.4) 50%,
              transparent 70%
            ),
            /* Tertiary micro-highlight */
            radial-gradient(ellipse 6% 4% at 55% 38%, 
              rgba(255,255,255,0.7) 0%, 
              transparent 80%
            ),
            /* Fresnel rim - edges appear brighter (real water physics) */
            radial-gradient(ellipse 100% 100% at 50% 50%,
              transparent 55%,
              rgba(240,235,255,0.15) 65%,
              rgba(230,220,250,0.35) 75%,
              rgba(220,200,245,0.5) 82%,
              rgba(210,185,240,0.35) 90%,
              rgba(200,170,235,0.15) 96%,
              transparent 100%
            ),
            /* Subsurface scattering - light passing through */
            radial-gradient(ellipse 75% 75% at 42% 42%,
              rgba(250,248,255,0.85) 0%,
              rgba(245,240,255,0.6) 15%,
              rgba(238,230,252,0.35) 30%,
              rgba(230,218,248,0.15) 45%,
              transparent 60%
            ),
            /* Caustic refraction pattern */
            radial-gradient(ellipse 25% 35% at 62% 58%,
              rgba(255,255,255,0.2) 0%,
              rgba(255,255,255,0.08) 40%,
              transparent 60%
            ),
            /* Deep base - purple tones matching lotus logo */
            radial-gradient(ellipse 100% 100% at 50% 50%, 
              #F5F0FF 0%, 
              #EDE5FF 8%,
              #E5DBFF 16%,
              #DDD0FF 25%,
              #D4C4FF 35%,
              #CBB8FF 45%,
              #C2ACFF 55%,
              #B8A0F9 65%,
              #AE94F3 75%,
              #A488ED 85%,
              #9A7CE7 92%,
              #9070E1 100%
            );
          box-shadow: 
            /* Inner light transmission - top-left bright zone */
            inset 18px 18px 50px rgba(255,255,255,0.65),
            inset 8px 8px 25px rgba(255,255,255,0.45),
            /* Inner shadow - bottom-right depth */
            inset -22px -22px 45px rgba(154,112,225,0.2),
            inset -10px -10px 20px rgba(174,148,243,0.12),
            /* Contact shadow */
            0 20px 40px rgba(154,112,225,0.18),
            0 8px 16px rgba(174,148,243,0.12),
            /* Ambient light bleed */
            0 0 50px rgba(200,176,255,0.3),
            0 0 90px rgba(220,200,255,0.18),
            0 0 130px rgba(235,225,255,0.08);
          animation: bubble-wobble 4s ease-in-out infinite;
        }

        /* ========================================
           Splash Droplets - Hyper-realistic
           Same rendering principles as main bubble
           ======================================== */
        .droplet {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          background: 
            /* Intense specular hotspot */
            radial-gradient(ellipse 30% 22% at 28% 26%, 
              rgba(255,255,255,1) 0%, 
              rgba(255,255,255,0.85) 25%,
              rgba(255,255,255,0.3) 50%,
              transparent 65%
            ),
            /* Secondary catchlight */
            radial-gradient(ellipse 15% 10% at 42% 32%, 
              rgba(255,255,255,0.7) 0%, 
              transparent 60%
            ),
            /* Fresnel rim glow */
            radial-gradient(ellipse 100% 100% at 50% 50%,
              transparent 50%,
              rgba(240,235,255,0.3) 70%,
              rgba(225,215,250,0.4) 85%,
              transparent 100%
            ),
            /* Subsurface scatter */
            radial-gradient(ellipse 65% 65% at 40% 40%,
              rgba(250,248,255,0.75) 0%,
              rgba(240,235,255,0.4) 30%,
              transparent 55%
            ),
            /* Base body - purple tones */
            radial-gradient(ellipse at 50% 50%, 
              #F5F0FF 0%, 
              #E5DBFF 20%,
              #D4C4FF 45%,
              #C2ACFF 70%,
              #B0A0F9 100%
            );
          box-shadow: 
            inset 6px 6px 18px rgba(255,255,255,0.55),
            inset -6px -6px 12px rgba(176,160,249,0.18),
            0 6px 15px rgba(174,148,243,0.15),
            0 0 22px rgba(200,176,255,0.22),
            0 0 35px rgba(220,200,255,0.12);
        }

        .drop-1 {
          width: 35px;
          height: 35px;
          animation: splash-1 3s ease-in-out infinite;
        }

        .drop-2 {
          width: 28px;
          height: 28px;
          animation: splash-2 3.2s ease-in-out infinite 0.2s;
        }

        .drop-3 {
          width: 22px;
          height: 22px;
          animation: splash-3 2.8s ease-in-out infinite 0.4s;
        }

        .drop-4 {
          width: 18px;
          height: 18px;
          animation: splash-4 3.5s ease-in-out infinite 0.1s;
        }

        .drop-5 {
          width: 30px;
          height: 30px;
          animation: splash-5 3.3s ease-in-out infinite 0.3s;
        }

        .drop-6 {
          width: 15px;
          height: 15px;
          animation: splash-6 2.9s ease-in-out infinite 0.5s;
        }

        .drop-7 {
          width: 25px;
          height: 25px;
          animation: splash-7 3.1s ease-in-out infinite 0.15s;
        }

        .drop-8 {
          width: 20px;
          height: 20px;
          animation: splash-8 3.4s ease-in-out infinite 0.35s;
        }

        /* ========================================
           Highlight Overlay
           ======================================== */
        .highlight-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          pointer-events: none;
        }

        .shine {
          position: absolute;
          border-radius: 50%;
        }

        /* Primary specular highlight - crisp white reflection */
        .shine-1 {
          width: 52px;
          height: 22px;
          top: 22%;
          left: 17%;
          background: linear-gradient(
            140deg,
            rgba(255,255,255,1) 0%,
            rgba(255,255,255,0.95) 15%,
            rgba(255,255,255,0.7) 35%,
            rgba(255,255,255,0.3) 55%,
            rgba(255,255,255,0.05) 75%,
            transparent 100%
          );
          filter: blur(0.5px);
          opacity: 0.92;
          animation: shine-move 4s ease-in-out infinite;
        }

        /* Secondary highlight - softer diffused */
        .shine-2 {
          width: 26px;
          height: 13px;
          top: 36%;
          left: 15%;
          background: linear-gradient(
            125deg,
            rgba(255,255,255,0.85) 0%,
            rgba(255,255,255,0.5) 35%,
            rgba(255,255,255,0.15) 65%,
            transparent 90%
          );
          filter: blur(0.3px);
          opacity: 0.7;
          animation: shine-move 4s ease-in-out infinite 0.5s;
        }

        /* Tertiary micro-highlight - tiny accent */
        .shine-3 {
          width: 10px;
          height: 6px;
          top: 28%;
          left: 42%;
          background: rgba(255,255,255,0.75);
          filter: blur(0.2px);
          opacity: 0.6;
          animation: shine-move 4s ease-in-out infinite 0.8s;
        }

        /* ========================================
           Animations
           ======================================== */
        @keyframes bubble-wobble {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            border-radius: 50%;
          }
          25% {
            transform: translate(-50%, -50%) scale(1.03);
            border-radius: 48% 52% 50% 50% / 52% 48% 52% 48%;
          }
          50% {
            transform: translate(-50%, -50%) scale(0.98);
            border-radius: 52% 48% 48% 52% / 48% 52% 48% 52%;
          }
          75% {
            transform: translate(-50%, -50%) scale(1.02);
            border-radius: 50% 50% 52% 48% / 50% 50% 50% 50%;
          }
        }

        /* Splash animations - droplets fly out and return */
        @keyframes splash-1 {
          0%, 100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
          10% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; }
          30% { transform: translate(calc(-50% + 100px), calc(-50% - 80px)) scale(1); opacity: 1; }
          50% { transform: translate(calc(-50% + 110px), calc(-50% - 60px)) scale(0.9); opacity: 0.9; }
          70% { transform: translate(calc(-50% + 60px), calc(-50% - 20px)) scale(0.7); opacity: 0.6; }
          90% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
        }

        @keyframes splash-2 {
          0%, 100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
          10% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; }
          30% { transform: translate(calc(-50% - 90px), calc(-50% - 70px)) scale(1); opacity: 1; }
          50% { transform: translate(calc(-50% - 100px), calc(-50% - 50px)) scale(0.9); opacity: 0.9; }
          70% { transform: translate(calc(-50% - 50px), calc(-50% - 15px)) scale(0.7); opacity: 0.6; }
          90% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
        }

        @keyframes splash-3 {
          0%, 100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
          10% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; }
          30% { transform: translate(calc(-50% + 60px), calc(-50% - 110px)) scale(1); opacity: 1; }
          50% { transform: translate(calc(-50% + 65px), calc(-50% - 90px)) scale(0.9); opacity: 0.9; }
          70% { transform: translate(calc(-50% + 35px), calc(-50% - 30px)) scale(0.7); opacity: 0.6; }
          90% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
        }

        @keyframes splash-4 {
          0%, 100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
          10% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; }
          30% { transform: translate(calc(-50% - 70px), calc(-50% - 100px)) scale(1); opacity: 1; }
          50% { transform: translate(calc(-50% - 75px), calc(-50% - 80px)) scale(0.9); opacity: 0.9; }
          70% { transform: translate(calc(-50% - 40px), calc(-50% - 25px)) scale(0.7); opacity: 0.6; }
          90% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
        }

        @keyframes splash-5 {
          0%, 100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
          10% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; }
          30% { transform: translate(calc(-50% + 120px), calc(-50% - 40px)) scale(1); opacity: 1; }
          50% { transform: translate(calc(-50% + 125px), calc(-50% - 25px)) scale(0.9); opacity: 0.9; }
          70% { transform: translate(calc(-50% + 70px), calc(-50% - 10px)) scale(0.7); opacity: 0.6; }
          90% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
        }

        @keyframes splash-6 {
          0%, 100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
          10% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; }
          30% { transform: translate(calc(-50% - 110px), calc(-50% - 30px)) scale(1); opacity: 1; }
          50% { transform: translate(calc(-50% - 115px), calc(-50% - 15px)) scale(0.9); opacity: 0.9; }
          70% { transform: translate(calc(-50% - 60px), calc(-50% - 5px)) scale(0.7); opacity: 0.6; }
          90% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
        }

        @keyframes splash-7 {
          0%, 100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
          10% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; }
          30% { transform: translate(calc(-50% + 80px), calc(-50% + 90px)) scale(1); opacity: 1; }
          50% { transform: translate(calc(-50% + 85px), calc(-50% + 100px)) scale(0.9); opacity: 0.9; }
          70% { transform: translate(calc(-50% + 45px), calc(-50% + 40px)) scale(0.7); opacity: 0.6; }
          90% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
        }

        @keyframes splash-8 {
          0%, 100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
          10% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; }
          30% { transform: translate(calc(-50% - 85px), calc(-50% + 80px)) scale(1); opacity: 1; }
          50% { transform: translate(calc(-50% - 90px), calc(-50% + 90px)) scale(0.9); opacity: 0.9; }
          70% { transform: translate(calc(-50% - 45px), calc(-50% + 35px)) scale(0.7); opacity: 0.6; }
          90% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
        }

        @keyframes shine-move {
          0%, 100% { transform: translate(0, 0); opacity: 0.7; }
          50% { transform: translate(10px, 8px); opacity: 0.5; }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .main-bubble, .droplet, .shine {
            animation: none !important;
          }
          .droplet {
            opacity: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}

export default LavaLamp
