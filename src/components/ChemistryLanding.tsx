import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ChevronDown, Cpu, Compass, Play, RefreshCw, Key, LogIn, ArrowRight, AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react';

interface ChemistryLandingProps {
  onUnlock: (email: string) => void;
  onVerifyLogin: (email: string, pass: string) => boolean;
  darkMode: boolean;
}

interface Star3D {
  id: number;
  x: number; // percentage from center
  y: number; // percentage from center
  z: number; // Z depth in pixels (-100 to -2200)
  size: number;
  opacity: number;
  angle: number; // pre-calculated angle from center for warp stretch
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

  // Velocity tracking for star warp stretch
  const [velocity, setVelocity] = useState(0);
  const lastProgress = useRef(0);
  const velocityRef = useRef(0);

  // 3D Starfield list
  const [stars, setStars] = useState<Star3D[]>([]);

  useEffect(() => {
    // Generate 180 stars scattered in a 3D volume
    const generatedStars: Star3D[] = [];
    for (let i = 0; i < 185; i++) {
      // Generate coordinates centered around (50, 50)
      const rx = (Math.random() - 0.5) * 110; 
      const ry = (Math.random() - 0.5) * 110;
      const angle = Math.atan2(ry, rx);
      
      generatedStars.push({
        id: i,
        x: rx + 50,
        y: ry + 50,
        z: -150 - Math.random() * 2050, // depth from -150px to -2200px
        size: Math.random() * 2.2 + 0.8,
        opacity: Math.random() * 0.7 + 0.3,
        angle,
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
      // 1. Smoothly interpolate progress
      const diff = targetScrollProgress.current - currentScrollProgress.current;
      currentScrollProgress.current += diff * 0.08; // Easing constant
      const progress = currentScrollProgress.current;
      setScrollProgress(progress);

      // 2. Calculate scroll velocity for warp stretch
      const rawVelocity = Math.abs(progress - lastProgress.current);
      lastProgress.current = progress;
      
      // Smooth out the velocity values
      velocityRef.current = rawVelocity * 0.75 + velocityRef.current * 0.25;
      setVelocity(velocityRef.current);

      // 3. Section triggers based on scroll progress
      if (progress < 0.28) {
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

  // ================= 3D CAMERA FLIGHT CALCULATIONS =================
  // cameraZ moves from 220px (close-up on Earth surface) to -2410px (close-up on Moon surface)
  let cameraZ = 0;
  let cameraX = 0;
  let cameraY = 0;

  // Earth coordinates
  let earthX = 0;
  let earthY = 0;
  let earthZ = 0;
  let earthOpacity = 1.0;

  // Moon coordinates
  const moonZ = -2450; // far in the background
  let moonX = 0;
  let moonY = 0;
  let moonOpacity = 0;

  if (scrollProgress < 0.25) {
    // Stage 1: Zoom out from Earth's surface
    // cameraZ goes from 220px to 480px
    const localRatio = scrollProgress / 0.25;
    cameraZ = 220 + localRatio * 260;
    cameraX = 0;
    cameraY = 0;

    earthX = 0;
    earthY = 0;
    earthZ = 0;
    earthOpacity = 1.0;

    moonOpacity = 0.02; // faint outline in distance
  } else if (scrollProgress < 0.80) {
    // Stage 2: Space flight & Earth fly-by
    // cameraZ flies forward from 480px to -2100px
    const localRatio = (scrollProgress - 0.25) / 0.55;
    cameraZ = 480 - localRatio * 2580;
    
    // Slight camera curve pan
    cameraX = Math.sin(localRatio * Math.PI) * -120;
    cameraY = Math.sin(localRatio * Math.PI) * 40;

    // Earth moves off to the right side as we fly past
    earthX = localRatio * 600;
    earthY = localRatio * -100;
    earthZ = localRatio * 200;

    // Fade out Earth as it passes behind the camera clipping plane
    if (cameraZ < 180) {
      earthOpacity = Math.max(0, (cameraZ + 100) / 280);
    } else {
      earthOpacity = 1.0;
    }

    // Moon slowly centers and grows visible
    moonOpacity = Math.min(1.0, localRatio * 1.5);
  } else {
    // Stage 3: Lunar Descent & Landing
    // cameraZ goes from -2100px to -2410px (Landing on Moon surface)
    const localRatio = (scrollProgress - 0.80) / 0.20;
    cameraZ = -2100 - localRatio * 310;
    cameraX = 0;
    cameraY = 0;

    earthOpacity = 0; // completely passed
    moonOpacity = 1.0;
  }

  // Altitude reading calculation
  const currentAltitude = Math.max(0, Math.floor(384400 * (1 - scrollProgress)));

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[400vh] w-full bg-[#02040a] text-slate-100 font-sans selection:bg-indigo-500/20 overflow-x-hidden"
    >
      {/* ================= FIXED 3D VIEWPORT CONTAINER ================= */}
      <div 
        className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
        style={{
          perspective: '800px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* Ambient Cosmic Background */}
        <div className="absolute inset-0 bg-[#02040a]" />
        
        {/* Soft glowing space nebulas */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-950/20 blur-[130px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-950/15 blur-[150px] mix-blend-screen" />

        {/* ================= THE 3D SCENE GRAPH ================= */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translate3d(${-cameraX}px, ${-cameraY}px, ${cameraZ}px)`,
            willChange: 'transform',
          }}
        >
          
          {/* 3D Starfield with velocity warp stretching */}
          {stars.map((star) => {
            // Stretch factor based on scroll velocity
            const stretchFactor = 1 + velocity * 130;
            
            // Apply scaleX and rotate radially from center
            const transformStr = `translate3d(${star.x - 50}vw, ${star.y - 50}vh, ${star.z}px) rotate(${star.angle}rad) scaleX(${stretchFactor})`;

            return (
              <div
                key={star.id}
                className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: transformStr,
                  opacity: star.opacity,
                  willChange: 'transform',
                  boxShadow: star.size > 2 ? '0 0 4px rgba(255, 255, 255, 0.8)' : 'none',
                }}
              />
            );
          })}

          {/* ================= 3D PLANET EARTH ================= */}
          {earthOpacity > 0 && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                transformStyle: 'preserve-3d',
                transform: `translate3d(calc(-50% + ${earthX}px), calc(-50% + ${earthY}px), ${earthZ}px) rotateY(${scrollProgress * 25}deg)`,
                opacity: earthOpacity,
                willChange: 'transform, opacity',
              }}
            >
              {/* Earth SVG (HD detailed) */}
              <svg viewBox="0 0 500 500" className="w-[420px] h-[420px] drop-shadow-[0_0_60px_rgba(59,130,246,0.3)]">
                <defs>
                  {/* Atmospheric edge glow */}
                  <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="90%" stopColor="#1e3a8a" stopOpacity="0" />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity="1" />
                  </radialGradient>
                  {/* Sphere Shading shadow */}
                  <radialGradient id="earthShading" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.12)" />
                    <stop offset="50%" stopColor="rgba(0, 0, 0, 0.5)" />
                    <stop offset="92%" stopColor="rgba(0, 0, 0, 0.98)" />
                    <stop offset="100%" stopColor="rgba(0, 0, 0, 1)" />
                  </radialGradient>
                  <radialGradient id="oceanGrad" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </radialGradient>
                  <mask id="earthMask">
                    <circle cx="250" cy="250" r="235" fill="white" />
                  </mask>
                </defs>

                {/* Glow ring */}
                <circle cx="250" cy="250" r="248" fill="url(#earthGlow)" />

                {/* Sphere core */}
                <g mask="url(#earthMask)">
                  <circle cx="250" cy="250" r="235" fill="url(#oceanGrad)" />

                  {/* Stylized HD Continents */}
                  <g fill="#166534" opacity="0.95">
                    {/* North & South Americas */}
                    <path d="M120,80 Q100,100 110,140 T150,180 T170,260 T200,320 T210,400 T190,440 L210,460 L230,420 L220,380 L230,320 L210,280 L200,240 Q220,200 230,160 Q210,130 180,100 Z" />
                    {/* Europe & Africa */}
                    <path d="M300,100 Q280,120 270,160 T300,240 T360,280 T380,340 L410,320 L400,280 L440,240 Q450,180 420,130 Q380,80 320,80 Z" />
                    <path d="M260,60 Q280,40 340,30 L380,40 L400,70 L340,90 Z" />
                    {/* Asia */}
                    <path d="M360,60 Q400,50 450,80 L460,130 L420,170 L380,150 Z" />
                    <path d="M380,160 Q420,180 450,220 L430,260 L380,220 Z" />
                    {/* Australia */}
                    <path d="M390,360 Q420,370 430,400 L410,420 L370,400 Z" />
                    {/* Polar Cap */}
                    <path d="M200,18 Q250,10 280,18 L270,40 L195,35 Z" fill="#f1f5f9" />
                  </g>

                  {/* Slowly rotating cloud layer */}
                  <g className="animate-spin" style={{ transformOrigin: '250px 250px', animationDuration: '100s' }}>
                    <path d="M80,120 Q160,90 240,130 T340,110 T440,140" fill="none" stroke="white" strokeWidth="18" strokeLinecap="round" opacity="0.35" />
                    <path d="M100,220 Q200,270 300,220 T420,240" fill="none" stroke="white" strokeWidth="22" strokeLinecap="round" opacity="0.38" />
                    <path d="M90,340 Q170,290 260,350 T400,310" fill="none" stroke="white" strokeWidth="14" strokeLinecap="round" opacity="0.35" />
                  </g>

                  {/* Shading overlay */}
                  <circle cx="250" cy="250" r="235" fill="url(#earthShading)" />
                </g>
              </svg>
            </div>
          )}

          {/* ================= 3D PLANET MOON ================= */}
          {moonOpacity > 0 && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                transformStyle: 'preserve-3d',
                transform: `translate3d(calc(-50% + ${moonX}px), calc(-50% + ${moonY}px), ${moonZ}px) rotateY(${-scrollProgress * 15}deg)`,
                opacity: moonOpacity,
                willChange: 'transform, opacity',
              }}
            >
              {/* Moon SVG (HD detailed) */}
              <svg viewBox="0 0 500 500" className="w-[400px] h-[400px] drop-shadow-[0_0_70px_rgba(241,245,249,0.15)]">
                <defs>
                  {/* Moon Halo glow */}
                  <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="85%" stopColor="rgba(226, 232, 240, 0)" />
                    <stop offset="94%" stopColor="rgba(226, 232, 240, 0.12)" />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0.25)" />
                  </radialGradient>
                  {/* Moon shading */}
                  <radialGradient id="moonShading" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
                    <stop offset="55%" stopColor="rgba(0, 0, 0, 0.5)" />
                    <stop offset="94%" stopColor="rgba(0, 0, 0, 0.98)" />
                    <stop offset="100%" stopColor="rgba(0, 0, 0, 1)" />
                  </radialGradient>
                  <radialGradient id="moonBase" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </radialGradient>
                  <mask id="moonMask">
                    <circle cx="250" cy="250" r="235" fill="white" />
                  </mask>
                </defs>

                {/* Glow ring */}
                <circle cx="250" cy="250" r="245" fill="url(#moonGlow)" />

                {/* Sphere core */}
                <g mask="url(#moonMask)">
                  <circle cx="250" cy="250" r="235" fill="url(#moonBase)" />

                  {/* Dark Plains (Maria) */}
                  <g fill="#64748b" opacity="0.4">
                    <path d="M120,130 Q160,110 210,130 T280,180 T240,240 T150,220 Z" />
                    <path d="M290,120 Q330,100 370,140 T360,220 T280,210 Z" />
                    <path d="M180,260 Q220,290 280,280 T350,320 T260,380 T160,330 Z" />
                    <path d="M110,230 Q90,260 120,300 T170,280 Z" />
                  </g>

                  {/* HD craters details */}
                  <g opacity="0.65">
                    {/* Tycho Crater */}
                    <circle cx="250" cy="380" r="16" fill="#cbd5e1" stroke="#475569" strokeWidth="2.5" />
                    <circle cx="250" cy="380" r="5" fill="#f8fafc" />
                    <path d="M250,380 L230,445 M250,380 L270,445 M250,380 L200,360 M250,380 L300,360 M250,380 L170,410 M250,380 L330,410 M250,380 L250,230 M250,380 L210,290 M250,380 L290,290" stroke="#f8fafc" strokeWidth="1.2" opacity="0.35" />

                    {/* Copernicus Crater */}
                    <circle cx="180" cy="210" r="13" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
                    <circle cx="180" cy="210" r="4" fill="#f8fafc" />

                    {/* Kepler Crater */}
                    <circle cx="140" cy="230" r="8" fill="#94a3b8" stroke="#475569" strokeWidth="1" />

                    {/* Plato Crater */}
                    <ellipse cx="230" cy="90" rx="14" ry="8" fill="#475569" stroke="#475569" strokeWidth="1.5" />

                    {/* Additional small craters */}
                    <circle cx="310" cy="150" r="7" fill="#cbd5e1" stroke="#475569" />
                    <circle cx="340" cy="250" r="9" fill="#cbd5e1" stroke="#475569" />
                    <circle cx="210" cy="150" r="6" fill="#cbd5e1" stroke="#475569" />
                    <circle cx="270" cy="240" r="9" fill="#cbd5e1" stroke="#475569" />
                  </g>

                  {/* Spherical Shadow overlay */}
                  <circle cx="250" cy="250" r="235" fill="url(#moonShading)" />
                </g>
              </svg>
            </div>
          )}

        </div>
      </div>

      {/* ================= FIXED HEADER ================= */}
      <header className="fixed top-0 left-0 w-full p-6 md:p-8 flex items-center justify-between z-45 select-none pointer-events-none">
        <div className="flex flex-col text-left pointer-events-auto cursor-pointer" onClick={() => handleSectionJump(0)}>
          <span className="text-[20px] font-black tracking-[0.16em] text-white uppercase font-sans">
            IGLOO
          </span>
          <span className="text-[8px] font-bold text-sky-400 tracking-[0.4em] uppercase font-mono mt-0.5">
            DESIGN LAB
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono pointer-events-auto">
          <button onClick={() => handleSectionJump(0)} className={`hover:text-white transition-colors cursor-pointer ${activeSection === 0 ? 'text-sky-400' : ''}`}>01 / DEPARTURE</button>
          <button onClick={() => handleSectionJump(1)} className={`hover:text-white transition-colors cursor-pointer ${activeSection === 1 ? 'text-sky-400' : ''}`}>02 / WARP SPEED</button>
          <button onClick={() => handleSectionJump(2)} className={`hover:text-white transition-colors cursor-pointer ${activeSection === 2 ? 'text-sky-400' : ''}`}>03 / APPROACH</button>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-full text-[9px] font-black text-sky-400 tracking-wider flex items-center gap-1.5 shadow-md">
            <Shield size={10} className="animate-pulse" />
            <span>SECURE INGRESS GATEWAY</span>
          </div>
        </div>
      </header>

      {/* ================= FLIGHT TELEMETRY readouts ================= */}
      <div className="fixed left-6 md:left-8 bottom-8 z-30 select-none font-mono text-[9px] text-slate-500 tracking-widest hidden md:flex flex-col gap-1.5 leading-none pointer-events-none text-left">
        <div className="flex items-center gap-1.5">
          <Compass size={11} className="text-sky-500" />
          <span>ALTITUDE: {currentAltitude.toLocaleString()} KM</span>
        </div>
        <div>VELOCITY: {Math.floor(11.2 * (1 + scrollProgress * 5 + velocity * 200))} KM/S</div>
        <div>PROPULSION: {velocity > 0.005 ? 'HYPERDRIVE ACTIVE' : 'STEADY ORBIT'}</div>
        <div>SYS STATUS: STABLE</div>
      </div>

      {/* ================= RIGHT SCROLL DOT STAGE LINKERS ================= */}
      <div className="fixed right-6 md:right-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-6 select-none text-right font-mono text-[9px] pointer-events-auto">
        {[
          { num: '01', label: 'EARTH DEPARTURE' },
          { num: '02', label: 'SPACE FLIGHT' },
          { num: '03', label: 'LUNAR APPROACH' },
          { num: '04', label: 'MOON LANDING' }
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

      {/* ================= DOWNWARDS SCROLL INDICATOR ================= */}
      <AnimatePresence>
        {scrollProgress < 0.85 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.6, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 font-mono text-[9px] text-slate-400 tracking-[0.3em] pointer-events-none uppercase"
          >
            <span>SCROLL TO LAUNCH</span>
            <ChevronDown size={14} className="text-sky-400" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= CINEMATIC STAGE OVERLAYS ================= */}
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
                STAGE 01 // ORBIT BYPASS
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
                EARTH DEPARTURE
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Starting from low Earth orbit. Scroll down to zoom out from the Earth's surface and initiate the hyperdrive ignition sequence.
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
                STAGE 02 // SPEED INTERCEPT
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
                HYPERDRIVE ACTIVE
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold font-mono">
                Warp drive active. Stars stretch into speed lines based on your scroll velocity. Earth falls behind as we race towards the Moon.
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
                STAGE 03 // GRAVITY ASSIST
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
                LUNAR INTERCEPT
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Approaching the Moon. Decelerating to orbital speeds. Preparing to descend onto the lunar landscape.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================= THE FINAL LUNAR LANDING LOGIN GATE ================= */}
      <AnimatePresence>
        {scrollProgress >= 0.75 && (() => {
          const progressRatio = Math.max(0, Math.min(1, (scrollProgress - 0.75) / 0.15)); // 0 to 1
          const blurAmount = Math.max(0, 20 - progressRatio * 20);
          const opacityAmount = progressRatio;
          const scaleAmount = 0.93 + progressRatio * 0.07;
          const isInteractive = scrollProgress >= 0.85;

          return (
            <div 
              className={`fixed inset-0 z-30 flex items-center justify-center p-6 bg-slate-950/15 backdrop-blur-[2px] transition-all duration-300 ${isInteractive ? 'pointer-events-auto' : 'pointer-events-none'}`}
              style={{
                filter: `blur(${blurAmount}px)`,
                opacity: opacityAmount,
              }}
            >
              <motion.div
                style={{
                  transform: `scale(${scaleAmount})`,
                }}
                className="w-full max-w-md bg-slate-950/80 border-2 border-slate-800/80 p-8 rounded-[32px] shadow-[0_0_80px_rgba(0,0,0,0.85)] text-center flex flex-col space-y-5 select-none backdrop-blur-md"
              >
                {/* Visual bar detail */}
                <div className="w-16 h-1 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 rounded-full mx-auto" />

                <div className="mx-auto w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 animate-pulse">
                  <Lock size={20} />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black tracking-[0.3em] text-sky-400 uppercase font-mono block">STAGE 04 // MOON SURFACE LANDING</span>
                  <h3 className="text-xl font-extrabold uppercase tracking-tight text-white">Secure Ingress Decoded</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto font-medium">
                    You have successfully landed on the Moon's surface. Sign in to bypass the gate and enter the playground.
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Corporate Email</label>
                    <input
                      type="email"
                      required
                      value={localEmail}
                      onChange={(e) => setLocalEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full text-xs font-medium bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 focus:bg-slate-950 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-slate-100 select-text font-sans"
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
                        className="w-full text-xs font-medium bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 focus:bg-slate-950 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-slate-100 select-text font-sans"
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
                        <span>DECRYPTING BIOMETRICS...</span>
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
                  <span>RESTRICTED LUNAR TRANSMISSION ACTIVE</span>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Supra-light speed warp transition effect on successful bypass */}
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
              INGRESS BYPASS COMPLETE
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
