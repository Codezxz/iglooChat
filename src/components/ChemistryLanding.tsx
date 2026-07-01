import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ChevronDown, Cpu, Compass, Play, RefreshCw, Key, LogIn, ArrowRight, AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react';

interface ChemistryLandingProps {
  onUnlock: (email: string) => void;
  onVerifyLogin: (email: string, pass: string) => boolean;
  darkMode: boolean;
}

// Generate stars for the parallax space background
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  depth: number; // 1 (deep), 2 (mid), 3 (foreground)
}

export default function ChemistryLanding({ onUnlock, onVerifyLogin, darkMode }: ChemistryLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Local login states
  const [localEmail, setLocalEmail] = useState('');
  const [localPassword, setLocalPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Smooth scroll interpolation states
  const [scrollProgress, setScrollProgress] = useState(0);
  const targetScrollProgress = useRef(0);
  const currentScrollProgress = useRef(0);
  const [activeSection, setActiveSection] = useState(0);
  const [warpActive, setWarpActive] = useState(false);

  // Static list of stars to avoid re-renders
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Generate 150 randomized stars divided into 3 parallax depths
    const generatedStars: Star[] = [];
    for (let i = 0; i < 160; i++) {
      generatedStars.push({
        id: i,
        x: Math.random() * 100, // percentage x
        y: Math.random() * 100, // percentage y
        size: Math.random() * 1.8 + 0.6,
        opacity: Math.random() * 0.8 + 0.2,
        depth: Math.floor(Math.random() * 3) + 1, // 1, 2, or 3
      });
    }
    setStars(generatedStars);
  }, []);

  // Update target scroll progress based on window scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const currentRaw = window.scrollY / scrollHeight;
      targetScrollProgress.current = Math.max(0, Math.min(1, currentRaw));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth lerping loop for the scroll progress to ensure 60fps kinetic motion
  useEffect(() => {
    let animId: number;
    
    const updateInterpolation = () => {
      const diff = targetScrollProgress.current - currentScrollProgress.current;
      currentScrollProgress.current += diff * 0.09; // Easing constant
      const progress = currentScrollProgress.current;
      setScrollProgress(progress);

      // Section triggers based on scroll progress
      if (progress < 0.3) {
        setActiveSection(0);
      } else if (progress < 0.65) {
        setActiveSection(1);
      } else if (progress < 0.88) {
        setActiveSection(2);
      } else {
        setActiveSection(3);
      }

      animId = requestAnimationFrame(updateInterpolation);
    };

    animId = requestAnimationFrame(updateInterpolation);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleSectionJump = (secIndex: number) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    
    let targetRatio = 0;
    if (secIndex === 0) targetRatio = 0.02;
    else if (secIndex === 1) targetRatio = 0.45;
    else if (secIndex === 2) targetRatio = 0.80;
    else targetRatio = 0.99;

    window.scrollTo({
      top: targetRatio * scrollHeight,
      behavior: 'smooth'
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const success = onVerifyLogin(localEmail, localPassword);
    if (success) {
      setWarpActive(true);
      setTimeout(() => {
        onUnlock(localEmail);
      }, 1200);
    } else {
      setLocalError('Invalid email or password. Access is restricted to authorized accounts.');
    }
  };

  // --- Dynamic Scroll Animation Calculations ---
  // Earth starts normal and scales up past the viewport (zooming past the viewer)
  const earthScale = 1 + scrollProgress * 15;
  const earthOpacity = scrollProgress < 0.4 ? 1 - scrollProgress * 2.5 : 0;
  
  // Moon starts small and scales up to focal size, centering on the screen
  const moonScale = scrollProgress < 0.25 ? 0.05 : 0.05 + (scrollProgress - 0.25) * 1.6;
  const moonOpacity = scrollProgress < 0.25 ? 0 : Math.min(1, (scrollProgress - 0.25) * 5);
  
  // Parallax calculations for starfields (stars zoom outward from center)
  const getStarStyle = (star: Star) => {
    let scaleMultiplier = 1;
    let opacityMultiplier = 1;

    if (star.depth === 1) {
      // Deep stars: slow zoom
      scaleMultiplier = 1 + scrollProgress * 1.5;
    } else if (star.depth === 2) {
      // Mid stars: moderate zoom
      scaleMultiplier = 1 + scrollProgress * 3.5;
      opacityMultiplier = scrollProgress > 0.7 ? Math.max(0, 1 - (scrollProgress - 0.7) * 3) : 1;
    } else {
      // Foreground stars: fast zoom past screen
      scaleMultiplier = 1 + scrollProgress * 8;
      opacityMultiplier = scrollProgress > 0.4 ? Math.max(0, 1 - (scrollProgress - 0.4) * 2) : 1;
    }

    // Offset coordinates to make them zoom from center
    const xOffset = (star.x - 50) * scaleMultiplier + 50;
    const yOffset = (star.y - 50) * scaleMultiplier + 50;

    return {
      left: `${xOffset}%`,
      top: `${yOffset}%`,
      transform: `translate(-50%, -50%) scale(${star.size * (star.depth * 0.4 + 0.6)})`,
      opacity: star.opacity * opacityMultiplier,
    };
  };

  // Altitude reading drops as we go from Earth orbit (e.g. 300,000 km) to Moon landing (0 km)
  const currentAltitude = Math.max(0, Math.floor(384400 * (1 - scrollProgress)));

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[400vh] w-full bg-[#030712] text-slate-100 font-sans selection:bg-indigo-500/20"
    >
      {/* ================= FIXED RENDERING VIEWPORT ================= */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        
        {/* Prismatic Nebula Background Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(17,24,39,0.95)_0%,#030712_100%)]" />
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-gradient-to-tr from-sky-500/5 via-indigo-500/5 to-transparent blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent blur-[150px] mix-blend-screen" />

        {/* Dynamic Starfield Layer */}
        <div className="absolute inset-0 w-full h-full select-none">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute w-1 h-1 bg-white rounded-full transition-transform duration-75 ease-out"
              style={getStarStyle(star)}
            />
          ))}
        </div>

        {/* ================= DYNAMIC HD PLANET EARTH ================= */}
        {earthOpacity > 0 && (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `scale(${earthScale})`,
              opacity: earthOpacity,
              willChange: 'transform, opacity',
            }}
          >
            {/* HD Earth Graphic */}
            <svg viewBox="0 0 500 500" className="w-[320px] h-[320px] drop-shadow-[0_0_50px_rgba(59,130,246,0.35)]">
              <defs>
                {/* Spherical Shadow overlay */}
                <radialGradient id="earthShading" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
                  <stop offset="50%" stopColor="rgba(0, 0, 0, 0.4)" />
                  <stop offset="90%" stopColor="rgba(0, 0, 0, 0.95)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 1)" />
                </radialGradient>
                {/* Atmospheric edge glow */}
                <radialGradient id="atmosphereGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="90%" stopColor="#1e3a8a" stopOpacity="0" />
                  <stop offset="96%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="1" />
                </radialGradient>
                {/* Ocean and base colors */}
                <radialGradient id="oceanGrad" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </radialGradient>
                {/* Earth Mask */}
                <mask id="sphereMask">
                  <circle cx="250" cy="250" r="235" fill="white" />
                </mask>
              </defs>

              {/* Atmosphere outer ring */}
              <circle cx="250" cy="250" r="248" fill="url(#atmosphereGlow)" />

              {/* Masked Earth Sphere */}
              <g mask="url(#sphereMask)">
                {/* Ocean base */}
                <circle cx="250" cy="250" r="235" fill="url(#oceanGrad)" />

                {/* Landmass Vectors (HD continents stylized) */}
                <g fill="#15803d" opacity="0.9">
                  {/* North & South Americas */}
                  <path d="M120,80 Q100,100 110,140 T150,180 T170,260 T200,320 T210,400 T190,440 L210,460 L230,420 L220,380 L230,320 L210,280 L200,240 Q220,200 230,160 Q210,130 180,100 Z" />
                  {/* Africa, Europe, Asia */}
                  <path d="M300,100 Q280,120 270,160 T300,240 T360,280 T380,340 L410,320 L400,280 L440,240 Q450,180 420,130 Q380,80 320,80 Z" />
                  <path d="M260,60 Q280,40 340,30 L380,40 L400,70 L340,90 Z" />
                  {/* Australia */}
                  <path d="M390,360 Q420,370 430,400 L410,420 L370,400 Z" />
                  {/* Greenland / Ice */}
                  <path d="M210,15 Q240,10 260,20 L250,50 L200,40 Z" fill="#e2e8f0" />
                </g>

                {/* Swirling Dynamic Clouds (With CSS rotation) */}
                <g className="animate-spin" style={{ transformOrigin: '250px 250px', animationDuration: '90s' }}>
                  <path d="M80,100 Q150,80 220,110 T320,100 T420,130" fill="none" stroke="white" strokeWidth="15" strokeLinecap="round" opacity="0.35" />
                  <path d="M120,200 Q200,250 280,200 T400,220" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round" opacity="0.4" />
                  <path d="M90,320 Q160,280 250,330 T390,300" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" opacity="0.35" />
                </g>
                <g className="animate-spin" style={{ transformOrigin: '250px 250px', animationDuration: '60s', animationDirection: 'reverse' }}>
                  <path d="M140,150 Q220,120 300,160 T420,180" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" opacity="0.3" />
                  <path d="M60,260 Q180,310 280,270 T440,290" fill="none" stroke="white" strokeWidth="16" strokeLinecap="round" opacity="0.35" />
                </g>

                {/* 3D Sphere Shading overlay */}
                <circle cx="250" cy="250" r="235" fill="url(#earthShading)" />
              </g>
            </svg>
          </div>
        )}

        {/* ================= DYNAMIC HD MOON APPROACH ================= */}
        {moonOpacity > 0 && (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `scale(${moonScale})`,
              opacity: moonOpacity,
              willChange: 'transform, opacity',
            }}
          >
            {/* HD Moon Graphic */}
            <svg viewBox="0 0 500 500" className="w-[300px] h-[300px] drop-shadow-[0_0_60px_rgba(255,255,255,0.18)]">
              <defs>
                {/* 3D Spherical Shadow overlay */}
                <radialGradient id="moonShading" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
                  <stop offset="60%" stopColor="rgba(0, 0, 0, 0.45)" />
                  <stop offset="95%" stopColor="rgba(0, 0, 0, 0.95)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 1)" />
                </radialGradient>
                {/* Eerie Moon Halo */}
                <radialGradient id="moonHalo" cx="50%" cy="50%" r="50%">
                  <stop offset="85%" stopColor="rgba(226, 232, 240, 0)" />
                  <stop offset="95%" stopColor="rgba(226, 232, 240, 0.15)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.28)" />
                </radialGradient>
                {/* Moon Base Color */}
                <radialGradient id="moonBase" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </radialGradient>
                {/* Moon Mask */}
                <mask id="moonMask">
                  <circle cx="250" cy="250" r="235" fill="white" />
                </mask>
              </defs>

              {/* Outer soft halo */}
              <circle cx="250" cy="250" r="245" fill="url(#moonHalo)" />

              {/* Masked Moon Sphere */}
              <g mask="url(#moonMask)">
                {/* Base sphere */}
                <circle cx="250" cy="250" r="235" fill="url(#moonBase)" />

                {/* Mare (dark plains) vectors */}
                <g fill="#475569" opacity="0.45">
                  <path d="M120,130 Q160,110 210,130 T280,180 T240,240 T150,220 Z" />
                  <path d="M290,120 Q330,100 370,140 T360,220 T280,210 Z" />
                  <path d="M180,260 Q220,290 280,280 T350,320 T260,380 T160,330 Z" />
                  <path d="M110,230 Q90,260 120,300 T170,280 Z" />
                </g>

                {/* Detailed craters with bright highlights and dark shadows */}
                <g opacity="0.6">
                  {/* Tycho crater */}
                  <circle cx="250" cy="380" r="16" fill="#cbd5e1" stroke="#334155" strokeWidth="2" />
                  <circle cx="250" cy="380" r="6" fill="#f1f5f9" />
                  {/* Rays from Tycho */}
                  <path d="M250,380 L230,440 M250,380 L270,440 M250,380 L200,360 M250,380 L300,360 M250,380 L180,410 M250,380 L320,410 M250,380 L250,250 M250,380 L220,300 M250,380 L280,300" stroke="#f1f5f9" strokeWidth="1" opacity="0.4" />

                  {/* Copernicus crater */}
                  <circle cx="180" cy="210" r="14" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
                  <circle cx="180" cy="210" r="5" fill="#e2e8f0" />

                  {/* Kepler crater */}
                  <circle cx="140" cy="230" r="9" fill="#94a3b8" stroke="#334155" strokeWidth="1" />

                  {/* Plato crater */}
                  <ellipse cx="230" cy="90" rx="15" ry="9" fill="#475569" stroke="#334155" strokeWidth="1.5" />

                  {/* Various small random craters */}
                  <circle cx="310" cy="150" r="8" fill="#cbd5e1" stroke="#334155" />
                  <circle cx="340" cy="250" r="11" fill="#cbd5e1" stroke="#334155" />
                  <circle cx="330" cy="270" r="6" fill="#cbd5e1" stroke="#334155" />
                  <circle cx="210" cy="150" r="7" fill="#cbd5e1" stroke="#334155" />
                  <circle cx="270" cy="240" r="10" fill="#94a3b8" stroke="#334155" />
                </g>

                {/* 3D Sphere Shading overlay */}
                <circle cx="250" cy="250" r="235" fill="url(#moonShading)" />
              </g>
            </svg>
          </div>
        )}
      </div>

      {/* ================= FIXED HEADER ================= */}
      <header className="fixed top-0 left-0 w-full p-6 md:p-8 flex items-center justify-between z-40 select-none pointer-events-none">
        <div className="flex flex-col text-left pointer-events-auto cursor-pointer" onClick={() => handleSectionJump(0)}>
          <span className="text-[20px] font-black tracking-[0.16em] text-white uppercase font-sans">
            IGLOO
          </span>
          <span className="text-[8px] font-bold text-sky-400 tracking-[0.4em] uppercase font-mono mt-0.5">
            DESIGN LAB
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono pointer-events-auto">
          <button onClick={() => handleSectionJump(0)} className={`hover:text-white transition-colors cursor-pointer ${activeSection === 0 ? 'text-sky-400' : ''}`}>01 / ORBIT</button>
          <button onClick={() => handleSectionJump(1)} className={`hover:text-white transition-colors cursor-pointer ${activeSection === 1 ? 'text-sky-400' : ''}`}>02 / DESCENT</button>
          <button onClick={() => handleSectionJump(2)} className={`hover:text-white transition-colors cursor-pointer ${activeSection === 2 ? 'text-sky-400' : ''}`}>03 / INGRESS</button>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-full text-[9px] font-black text-sky-400 tracking-wider flex items-center gap-1.5 shadow-md">
            <Shield size={10} className="animate-pulse" />
            <span>SECURE INGRESS ACTIVE</span>
          </div>
        </div>
      </header>

      {/* ================= ATMOSPHERIC SIDEBAR TELEMETRY ================= */}
      <div className="fixed left-6 md:left-8 bottom-8 z-30 select-none font-mono text-[9px] text-slate-500 tracking-widest hidden md:flex flex-col gap-1.5 leading-none pointer-events-none text-left">
        <div className="flex items-center gap-1.5">
          <Compass size={11} className="text-sky-500" />
          <span>ALTITUDE: {currentAltitude.toLocaleString()} KM</span>
        </div>
        <div>VELOCITY: {Math.floor(12.6 * (1 + scrollProgress * 3))} KM/S</div>
        <div>SYS STATUS: STABLE</div>
        <div>STAGE: {activeSection === 3 ? 'LANDING COMPLETE' : `APPROACH 0${activeSection + 1}`}</div>
      </div>

      {/* ================= VERTICAL STAGE SCROLL INDICATORS ================= */}
      <div className="fixed right-6 md:right-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-6 select-none text-right font-mono text-[9px] pointer-events-auto">
        {[
          { num: '01', label: 'EARTH ORBIT' },
          { num: '02', label: 'LUNAR DESCENT' },
          { num: '03', label: 'LUNAR APPROACH' },
          { num: '04', label: 'INGRESS GATE' }
        ].map((sec, idx) => {
          const isActive = activeSection === idx;
          return (
            <button 
              key={idx}
              onClick={() => handleSectionJump(idx)}
              className="flex items-center justify-end gap-3 group text-left cursor-pointer transition-colors"
            >
              <div className={`transition-colors ${isActive ? 'text-sky-400 font-black' : 'text-slate-500 group-hover:text-slate-300'}`}>
                <span className="text-[8px] opacity-60 block tracking-wider leading-none">STAGE {sec.num}</span>
                <span className="font-bold tracking-widest leading-tight block">{sec.label}</span>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-sky-400 scale-150 ring-4 ring-sky-950' : 'bg-slate-700 group-hover:bg-slate-400'}`} />
            </button>
          );
        })}
      </div>

      {/* ================= FLOATING SCROLL INDICATOR ================= */}
      <AnimatePresence>
        {scrollProgress < 0.85 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.6, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 font-mono text-[9px] text-slate-400 tracking-[0.3em] pointer-events-none uppercase"
          >
            <span>SCROLL TO DESCEND</span>
            <ChevronDown size={14} className="text-sky-400" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= SCROLL NARRATIVE LABELS ================= */}
      <div className="fixed inset-0 pointer-events-none z-20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeSection === 0 && (
            <motion.div
              key="stage-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center space-y-3 px-6 max-w-lg select-none"
            >
              <span className="text-[10px] font-black text-sky-400 tracking-[0.5em] uppercase font-mono block">
                STAGE 01 // DEPARTURE
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
                EARTH ORBIT
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Departing low Earth orbit. Prepare for Trans-Lunar Injection. Scroll down to accelerate and enter the deep space void.
              </p>
            </motion.div>
          )}

          {activeSection === 1 && (
            <motion.div
              key="stage-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center space-y-3 px-6 max-w-lg select-none"
            >
              <span className="text-[10px] font-black text-sky-400 tracking-[0.5em] uppercase font-mono block">
                STAGE 02 // DEEP SPACE VOID
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
                LUNAR DESCENT
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Navigating the space void. Gravitational pull shifting to the lunar core. The Lunar horizon is now visible in the distance.
              </p>
            </motion.div>
          )}

          {activeSection === 2 && (
            <motion.div
              key="stage-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center space-y-3 px-6 max-w-lg select-none"
            >
              <span className="text-[10px] font-black text-sky-400 tracking-[0.5em] uppercase font-mono block">
                STAGE 03 // LUNAR APPROACH
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
                FINAL APPROACH
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Entering low lunar orbit. Commencing landing sequence. Secure corporate decryptor protocols are initializing.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================= LOGIN FORM (Unblurs in Stage 4) ================= */}
      <AnimatePresence>
        {scrollProgress >= 0.75 && (() => {
          const progressRatio = Math.max(0, Math.min(1, (scrollProgress - 0.75) / 0.15)); // 0 to 1
          const blurAmount = Math.max(0, 20 - progressRatio * 20);
          const opacityAmount = progressRatio;
          const scaleAmount = 0.94 + progressRatio * 0.06;
          const isInteractive = scrollProgress >= 0.85;

          return (
            <div 
              className={`fixed inset-0 z-30 flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-[2px] transition-all duration-300 ${isInteractive ? 'pointer-events-auto' : 'pointer-events-none'}`}
              style={{
                filter: `blur(${blurAmount}px)`,
                opacity: opacityAmount,
              }}
            >
              <motion.div
                style={{
                  transform: `scale(${scaleAmount})`,
                }}
                className="w-full max-w-md bg-slate-900/80 border-2 border-slate-800/85 p-8 rounded-[32px] shadow-[0_0_80px_rgba(0,0,0,0.85)] text-center flex flex-col space-y-5 select-none backdrop-blur-md"
              >
                {/* Top decorative bar */}
                <div className="w-16 h-1 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 rounded-full mx-auto" />

                <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center text-indigo-400 animate-pulse">
                  <Lock size={20} />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black tracking-[0.3em] text-sky-400 uppercase font-mono block">STAGE 04 // BIOMETRIC BYPASS</span>
                  <h3 className="text-xl font-extrabold uppercase tracking-tight text-white">Authorized Ingress</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto font-medium">
                    Please authenticate with your corporate credentials to access the Chat Igloo Playground.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4 text-left pointer-events-auto">
                  {localError && (
                    <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl flex items-start gap-2.5 text-red-400 text-xs font-semibold leading-relaxed">
                      <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                      <span>{localError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Email Address</label>
                    <input
                      type="email"
                      required
                      value={localEmail}
                      onChange={(e) => setLocalEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full text-xs font-medium bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 focus:bg-slate-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-100 select-text font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={localPassword}
                        onChange={(e) => setLocalPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs font-medium bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 focus:bg-slate-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-100 select-text font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={warpActive}
                    className="relative w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 active:from-sky-600 active:to-indigo-700 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-sky-500/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {warpActive ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>DECRYPTING KEYS...</span>
                      </>
                    ) : (
                      <>
                        <span>DECRYPT GATE</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-1 flex items-center justify-center gap-1 text-[9px] text-slate-500 tracking-wider font-mono uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span>SECURE QUANTUM COMMS ACTIVE</span>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Extreme supersonic transition warp overlay */}
      <AnimatePresence>
        {warpActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white pointer-events-none z-[100] flex flex-col items-center justify-center text-slate-950 font-black text-3xl tracking-[0.2em]"
            style={{
              mixBlendMode: 'difference'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-white text-center font-sans tracking-[0.5em] uppercase font-black"
            >
              INGRESS COMPLETE
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
