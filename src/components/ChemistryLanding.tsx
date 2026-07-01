import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ChevronDown, Compass, Lock, Eye, EyeOff, AlertTriangle, ArrowRight, RefreshCw, Star } from 'lucide-react';

interface ChemistryLandingProps {
  onUnlock: (email: string) => void;
  onVerifyLogin: (email: string, pass: string) => boolean;
  darkMode: boolean;
}

interface Star3D {
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  angle: number;
}

interface MemberProfile {
  id: number;
  stageName: string;
  fullName: string;
  position: string;
  birthday: string;
  bio: string;
  accentColor: string;
  gradient: string; // CSS radial gradient for the background nebula
  svgIcon: React.ReactNode;
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
    // Generate 170 stars scattered in a 3D volume
    const generatedStars: Star3D[] = [];
    for (let i = 0; i < 170; i++) {
      const rx = (Math.random() - 0.5) * 115; 
      const ry = (Math.random() - 0.5) * 115;
      const angle = Math.atan2(ry, rx);
      
      generatedStars.push({
        id: i,
        x: rx + 50,
        y: ry + 50,
        z: -100 - Math.random() * 2600, // depth from -100px to -2700px
        size: Math.random() * 2.0 + 0.6,
        opacity: Math.random() * 0.75 + 0.25,
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
      currentScrollProgress.current += diff * 0.08;
      const progress = currentScrollProgress.current;
      setScrollProgress(progress);

      // 2. Calculate velocity for star stretching
      const rawVelocity = Math.abs(progress - lastProgress.current);
      lastProgress.current = progress;
      velocityRef.current = rawVelocity * 0.72 + velocityRef.current * 0.28;
      setVelocity(velocityRef.current);

      // 3. Section triggers based on scroll progress (8 stages: 7 members + 1 login)
      const sectionCount = 8;
      const index = Math.max(0, Math.min(sectionCount - 1, Math.floor(progress * sectionCount)));
      setActiveSection(index);

      animId = requestAnimationFrame(updateInterpolation);
    };

    animId = requestAnimationFrame(updateInterpolation);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleSectionJump = (secIndex: number) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    
    // Jump positions mapping to the center of each of the 8 stages
    const targetRatio = (secIndex + 0.5) / 8;
    window.scrollTo({
      top: targetRatio * scrollHeight,
      behavior: 'smooth'
    });
  };

  // Define BTS Member profiles with names, roles, bios, and stylized HD SVGs
  const btsMembers: MemberProfile[] = [
    {
      id: 0,
      stageName: 'RM',
      fullName: 'Kim Nam-joon',
      position: 'Leader, Main Rapper',
      birthday: 'September 12, 1994',
      bio: 'The philosophical leader and intellectual anchor of BTS. Fluent in English, RM is a prolific lyricist and producer known for his deep introspective rap style.',
      accentColor: '#38bdf8', // Teal Blue
      gradient: 'radial-gradient(circle at 30% 30%, rgba(14,165,233,0.18) 0%, rgba(3,7,18,0) 70%)',
      svgIcon: (
        <svg viewBox="0 0 100 100" className="w-full h-full text-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.6)] animate-pulse">
          <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
          {/* Headphones */}
          <path d="M28,50 C28,34 38,24 50,24 C62,24 72,34 72,50" fill="none" stroke="currentColor" strokeWidth="3" />
          <rect x="23" y="46" width="10" height="12" rx="4" fill="currentColor" />
          <rect x="67" y="46" width="10" height="12" rx="4" fill="currentColor" />
          {/* Glowing central star */}
          <path d="M50,42 L52,48 L58,48 L53,52 L55,58 L50,54 L45,58 L47,52 L42,48 L48,48 Z" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 1,
      stageName: 'Jin',
      fullName: 'Kim Seok-jin',
      position: 'Sub Vocalist, Visual',
      birthday: 'December 4, 1992',
      bio: 'Known as "Worldwide Handsome". Jin delivers soaring, emotional high notes and brings infectious, bright energy. His solo "The Astronaut" captures his cosmic vision.',
      accentColor: '#ec4899', // Pink
      gradient: 'radial-gradient(circle at 70% 30%, rgba(236,72,153,0.18) 0%, rgba(3,7,18,0) 70%)',
      svgIcon: (
        <svg viewBox="0 0 100 100" className="w-full h-full text-pink-400 drop-shadow-[0_0_20px_rgba(236,72,153,0.6)] animate-spin" style={{ animationDuration: '20s' }}>
          {/* Astronaut Planet */}
          <circle cx="50" cy="50" r="22" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <ellipse cx="50" cy="50" rx="38" ry="8" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(-20 50 50)" />
          {/* Small orbiting moon */}
          <circle cx="20" cy="35" r="4" fill="currentColor" />
          <circle cx="80" cy="65" r="3" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 2,
      stageName: 'Suga',
      fullName: 'Min Yoon-gi',
      position: 'Lead Rapper',
      birthday: 'March 9, 1993',
      bio: 'Also producing as Agust D. Suga is a powerhouse rapper, songwriter, and producer. His music is defined by raw honesty, blazing verses, and a deep connection to the piano.',
      accentColor: '#f97316', // Flame Orange
      gradient: 'radial-gradient(circle at 30% 70%, rgba(249,115,22,0.18) 0%, rgba(3,7,18,0) 70%)',
      svgIcon: (
        <svg viewBox="0 0 100 100" className="w-full h-full text-orange-400 drop-shadow-[0_0_20px_rgba(249,115,22,0.6)]">
          {/* Piano keys & fire */}
          <path d="M25,65 L75,65 L75,75 L25,75 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="35" y1="65" x2="35" y2="75" stroke="currentColor" strokeWidth="2" />
          <line x1="45" y1="65" x2="45" y2="75" stroke="currentColor" strokeWidth="2" />
          <line x1="55" y1="65" x2="55" y2="75" stroke="currentColor" strokeWidth="2" />
          <line x1="65" y1="65" x2="65" y2="75" stroke="currentColor" strokeWidth="2" />
          {/* Burning Flame */}
          <path d="M50,15 C55,30 65,38 60,55 C55,50 48,46 48,38 C42,46 32,50 40,58 C30,48 42,32 50,15 Z" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 3,
      stageName: 'J-Hope',
      fullName: 'Jung Ho-seok',
      position: 'Main Dancer, Sub Rapper',
      birthday: 'February 18, 1994',
      bio: 'The radiant "hope" and main dancer of the group. J-Hope directs the group\'s choreography with absolute precision, delivering bright, rhythmic rap flows.',
      accentColor: '#eab308', // Sunshine Yellow
      gradient: 'radial-gradient(circle at 70% 70%, rgba(234,179,8,0.18) 0%, rgba(3,7,18,0) 70%)',
      svgIcon: (
        <svg viewBox="0 0 100 100" className="w-full h-full text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)] animate-pulse">
          {/* Radiant Sun/Hope emblem */}
          <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="50" y1="50"
              x2={50 + 28 * Math.cos((angle * Math.PI) / 180)}
              y2={50 + 28 * Math.sin((angle * Math.PI) / 180)}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
          {/* Central smile motif */}
          <path d="M43,48 Q45,45 47,48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M53,48 Q55,45 57,48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M42,54 Q50,60 58,54" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 4,
      stageName: 'Jimin',
      fullName: 'Park Ji-min',
      position: 'Main Dancer, Lead Vocalist',
      birthday: 'October 13, 1995',
      bio: 'Renowned for his elegant modern dance styling and mesmerizing falsetto vocals. Jimin captivates stages with a unique blend of delicate grace and intense power.',
      accentColor: '#a855f7', // Lavender Purple
      gradient: 'radial-gradient(circle at 30% 20%, rgba(168,85,247,0.18) 0%, rgba(3,7,18,0) 70%)',
      svgIcon: (
        <svg viewBox="0 0 100 100" className="w-full h-full text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]">
          {/* Crescent Moon & Feather */}
          <path d="M35,25 C48,25 58,35 58,48 C58,61 48,71 35,71 C45,71 52,61 52,48 C52,35 45,25 35,25 Z" fill="currentColor" />
          <path d="M45,45 Q62,35 70,55 Q60,52 50,55" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="45" y1="45" x2="40" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 5,
      stageName: 'V',
      fullName: 'Kim Tae-hyung',
      position: 'Lead Dancer, Sub Vocalist, Visual',
      birthday: 'December 30, 1995',
      bio: 'Features a soulful, deep baritone voice and striking visual charisma. V is highly artistic, drawing inspiration from retro jazz, photography, and classical art.',
      accentColor: '#10b981', // Emerald Green
      gradient: 'radial-gradient(circle at 70% 80%, rgba(16,185,129,0.18) 0%, rgba(3,7,18,0) 70%)',
      svgIcon: (
        <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]">
          {/* Retro Film Camera */}
          <rect x="25" y="36" width="50" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path d="M38,36 L43,30 L57,30 L62,36 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="50" cy="52" r="11" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="67" cy="42" r="2.5" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 6,
      stageName: 'Jungkook',
      fullName: 'Jeon Jung-guk',
      position: 'Main Vocalist, Lead Dancer, Center',
      birthday: 'September 1, 1997',
      bio: 'The "Golden Maknae" of BTS. Highly versatile, Jungkook anchors the group\'s vocals and choreography centers with powerful vocal stability and performance energy.',
      accentColor: '#f43f5e', // Crimson Red
      gradient: 'radial-gradient(circle at 50% 50%, rgba(244,63,94,0.18) 0%, rgba(3,7,18,0) 70%)',
      svgIcon: (
        <svg viewBox="0 0 100 100" className="w-full h-full text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse">
          {/* Golden Microphone & Crown */}
          <path d="M44,48 L56,48 L53,74 L47,74 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="42" y="32" width="16" height="16" rx="8" fill="currentColor" />
          <path d="M34,22 L40,28 L50,20 L60,28 L66,22 L62,32 L38,32 Z" fill="currentColor" />
        </svg>
      )
    }
  ];

  // ================= 3D CAMERA & MEMBER FLY-BY CALCULATIONS =================
  // Camera Z translation moves through the coordinate stack from 400px down to -3800px
  // Member stations are placed at Z: 0, -500, -1000, -1500, -2000, -2500, -3000
  // Moon is at Z: -3600
  const maxZFlight = -3500;
  const cameraZ = 450 + scrollProgress * (maxZFlight - 450);

  // Slight camera yaw/pitch pan to make the fly-by feel curved and three-dimensional
  const localCurveRatio = (scrollProgress * Math.PI * 4); 
  const cameraX = Math.sin(localCurveRatio) * -60;
  const cameraY = Math.cos(localCurveRatio) * 25;

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[500vh] w-full bg-[#02040a] text-slate-100 font-sans selection:bg-indigo-500/20 overflow-x-hidden"
    >
      {/* ================= FIXED 3D VIEWPORT CONTAINER ================= */}
      <div 
        className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
        style={{
          perspective: '800px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* Starry deep space background color */}
        <div className="absolute inset-0 bg-[#02040a]" />

        {/* Dynamic Color-shifting Background Nebulas */}
        {btsMembers.map((m, idx) => {
          // Calculate active opacity matching the scroll range of the member
          const centerRatio = (idx + 0.5) / 8; // center scroll position for stage
          const distance = Math.abs(scrollProgress - centerRatio);
          const opacity = Math.max(0, 1 - distance * 7); // peak at center, fade out quickly

          return (
            <div
              key={m.id}
              className="absolute inset-0 transition-opacity duration-300 pointer-events-none mix-blend-screen"
              style={{
                background: m.gradient,
                opacity: opacity,
              }}
            />
          );
        })}

        {/* Global Space Ambient Nebula for Moon Landing */}
        {scrollProgress >= 0.75 && (
          <div
            className="absolute inset-0 transition-opacity duration-500 pointer-events-none mix-blend-screen bg-[radial-gradient(circle_at_50%_50%,rgba(148,163,184,0.06)_0%,rgba(0,0,0,0)_80%)]"
            style={{
              opacity: Math.min(1.0, (scrollProgress - 0.75) * 4),
            }}
          />
        )}

        {/* ================= THE 3D SCENE GRAPH ================= */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translate3d(${-cameraX}px, ${-cameraY}px, ${cameraZ}px)`,
            willChange: 'transform',
          }}
        >
          
          {/* Parallax Starfield with velocity warp stretch */}
          {stars.map((star) => {
            const stretchFactor = 1 + velocity * 135;
            const transformStr = `translate3d(${star.x - 50}vw, ${star.y - 50}vh, ${star.z}px) rotate(${star.angle}rad) scaleX(${stretchFactor})`;

            return (
              <div
                key={star.id}
                className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: transformStr,
                  opacity: star.opacity,
                  willChange: 'transform',
                  boxShadow: star.size > 1.8 ? '0 0 3px rgba(255,255,255,0.7)' : 'none',
                }}
              />
            );
          })}

          {/* ================= 3D BTS MEMBERS FLY-BY PAGES ================= */}
          {btsMembers.map((member, idx) => {
            const memberZ = idx * -500; // stacked at Z: 0, -500, -1000, -1500...
            
            // Calculate distance to camera to handle entry / pass-by visibility
            // We want the card to fly in from the side as we approach, settle in the center, and fly away as we pass
            const distance = cameraZ - memberZ; // distance in Z pixels
            
            // Opacity curve: fades in as we approach, fades out after we pass
            let opacity = 1.0;
            if (distance > 650) {
              opacity = 0; // too far ahead
            } else if (distance > 350) {
              opacity = (650 - distance) / 300; // fade in approach
            } else if (distance < -150) {
              opacity = Math.max(0, (distance + 350) / 200); // fade out pass-by
            }

            // Alternating fly-by coordinate entries (left, right, bottom, top-left...)
            let flyX = 0;
            let flyY = 0;
            
            const directionRatio = Math.max(0, Math.min(1, (distance - 150) / 400)); // 1 (far ahead/approaching) to 0 (centered)
            
            if (idx % 3 === 0) {
              // Fly in from Left
              flyX = -directionRatio * 450;
            } else if (idx % 3 === 1) {
              // Fly in from Right
              flyX = directionRatio * 450;
            } else {
              // Fly in from Bottom
              flyY = directionRatio * 350;
            }

            // Card tilt / rotation orbit as we approach
            const rotateYVal = (idx % 2 === 0 ? 1 : -1) * (15 * directionRatio);

            if (opacity <= 0) return null;

            return (
              <div
                key={member.id}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transformStyle: 'preserve-3d',
                  transform: `translate3d(calc(-50% + ${flyX}px), calc(-50% + ${flyY}px), ${memberZ}px) rotateY(${rotateYVal}deg)`,
                  opacity: opacity,
                  willChange: 'transform, opacity',
                }}
                className="w-[90%] max-w-xl flex flex-col md:flex-row items-center gap-6 md:gap-10 p-6 md:p-8 rounded-[36px] bg-slate-950/40 border border-slate-800/80 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.6)] select-none pointer-events-auto"
              >
                {/* 3D Floating Icon wrapper */}
                <div 
                  className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-3xl bg-slate-950/60 border border-slate-800 flex items-center justify-center p-3 md:p-4 shadow-inner"
                  style={{
                    transform: `translateZ(30px) rotateY(${-rotateYVal * 1.5}deg)`,
                  }}
                >
                  {member.svgIcon}
                </div>

                {/* Profile Information */}
                <div 
                  className="flex-1 text-left space-y-3"
                  style={{
                    transform: 'translateZ(15px)',
                  }}
                >
                  <div className="space-y-1">
                    <span 
                      style={{ color: member.accentColor }} 
                      className="text-[9px] font-black uppercase tracking-[0.25em] font-mono block"
                    >
                      MEMBER 0{member.id + 1} // BTS PROFILE
                    </span>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none">
                      {member.stageName}
                    </h2>
                    <p className="text-xs text-slate-400 font-bold">
                      {member.fullName}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-800">
                      {member.position}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-800">
                      {member.birthday}
                    </span>
                  </div>

                  <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                    {member.bio}
                  </p>
                </div>
              </div>
            );
          })}

          {/* ================= 3D MOON LANDING ================= */}
          {scrollProgress >= 0.75 && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                transformStyle: 'preserve-3d',
                transform: `translate3d(0, 0, ${moonZ}px) rotateY(${-scrollProgress * 15}deg)`,
                opacity: Math.min(1.0, (scrollProgress - 0.75) * 4),
                willChange: 'transform, opacity',
              }}
            >
              {/* HD Moon SVG */}
              <svg viewBox="0 0 500 500" className="w-[450px] h-[450px] drop-shadow-[0_0_80px_rgba(241,245,249,0.18)]">
                <defs>
                  {/* Moon glow */}
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

                <circle cx="250" cy="250" r="245" fill="url(#moonGlow)" />
                <g mask="url(#moonMask)">
                  <circle cx="250" cy="250" r="235" fill="url(#moonBase)" />
                  <g fill="#64748b" opacity="0.4">
                    <path d="M120,130 Q160,110 210,130 T280,180 T240,240 T150,220 Z" />
                    <path d="M290,120 Q330,100 370,140 T360,220 T280,210 Z" />
                    <path d="M180,260 Q220,290 280,280 T350,320 T260,380 T160,330 Z" />
                    <path d="M110,230 Q90,260 120,300 T170,280 Z" />
                  </g>
                  <g opacity="0.65">
                    <circle cx="250" cy="380" r="16" fill="#cbd5e1" stroke="#475569" strokeWidth="2.5" />
                    <circle cx="250" cy="380" r="5" fill="#f8fafc" />
                    <path d="M250,380 L230,445 M250,380 L270,445 M250,380 L200,360 M250,380 L300,360 M250,380 L170,410 M250,380 L330,410 M250,380 L250,230 M250,380 L210,290 M250,380 L290,290" stroke="#f8fafc" strokeWidth="1.2" opacity="0.35" />
                    <circle cx="180" cy="210" r="13" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
                    <circle cx="180" cy="210" r="4" fill="#f8fafc" />
                    <circle cx="140" cy="230" r="8" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
                    <ellipse cx="230" cy="90" rx="14" ry="8" fill="#475569" stroke="#475569" strokeWidth="1.5" />
                    <circle cx="310" cy="150" r="7" fill="#cbd5e1" stroke="#475569" />
                    <circle cx="340" cy="250" r="9" fill="#cbd5e1" stroke="#475569" />
                  </g>
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
          <button onClick={() => handleSectionJump(0)} className={`hover:text-white transition-colors cursor-pointer ${activeSection < 7 ? 'text-sky-400' : ''}`}>01 / BTS MEMBERS</button>
          <button onClick={() => handleSectionJump(7)} className={`hover:text-white transition-colors cursor-pointer ${activeSection === 7 ? 'text-sky-400' : ''}`}>02 / LUNAR INGRESS</button>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-full text-[9px] font-black text-sky-400 tracking-wider flex items-center gap-1.5 shadow-md">
            <Shield size={10} className="animate-pulse" />
            <span>BTS PROFILE ACCESS ONLY</span>
          </div>
        </div>
      </header>

      {/* ================= SCROLL TELEMETRY readouts ================= */}
      <div className="fixed left-6 md:left-8 bottom-8 z-30 select-none font-mono text-[9px] text-slate-500 tracking-widest hidden md:flex flex-col gap-1.5 leading-none pointer-events-none text-left">
        <div className="flex items-center gap-1.5">
          <Compass size={11} className="text-sky-500" />
          <span>ALTITUDE: {currentAltitude.toLocaleString()} KM</span>
        </div>
        <div>VELOCITY: {Math.floor(11.2 * (1 + scrollProgress * 5.5 + velocity * 180))} KM/S</div>
        <div>PROPULSION: {velocity > 0.005 ? 'HYPERDRIVE ACTIVE' : 'LUNAR GRAVITY'}</div>
        <div>ACTIVE: {activeSection === 7 ? 'MOON GATE' : btsMembers[activeSection]?.stageName || 'RM'}</div>
      </div>

      {/* ================= RIGHT SCROLL DOT STAGE LINKERS ================= */}
      <div className="fixed right-6 md:right-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-5 select-none text-right font-mono text-[9px] pointer-events-auto">
        {btsMembers.map((m, idx) => {
          const isActive = activeSection === idx;
          return (
            <button 
              key={m.id}
              onClick={() => handleSectionJump(idx)}
              className="flex items-center justify-end gap-3 group text-left cursor-pointer transition-colors"
            >
              <div className={`transition-colors ${isActive ? 'text-sky-400 font-black' : 'text-slate-500 group-hover:text-slate-300'}`}>
                <span className="text-[7px] opacity-60 block tracking-wider leading-none">MEMBER 0{idx + 1}</span>
                <span className="font-bold tracking-widest leading-tight block">{m.stageName}</span>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'scale-150 ring-4' : 'bg-slate-700 group-hover:bg-slate-400'}`} style={{ backgroundColor: isActive ? m.accentColor : undefined, '--tw-ring-color': isActive ? `${m.accentColor}33` : undefined } as any} />
            </button>
          );
        })}
        <button 
          onClick={() => handleSectionJump(7)}
          className="flex items-center justify-end gap-3 group text-left cursor-pointer transition-colors"
        >
          <div className={`transition-colors ${activeSection === 7 ? 'text-sky-400 font-black' : 'text-slate-500 group-hover:text-slate-300'}`}>
            <span className="text-[7px] opacity-60 block tracking-wider leading-none">STAGE 08</span>
            <span className="font-bold tracking-widest leading-tight block">MOON GATE</span>
          </div>
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSection === 7 ? 'bg-sky-400 scale-150 ring-4 ring-sky-950' : 'bg-slate-700 group-hover:bg-slate-400'}`} />
        </button>
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
            <span>SCROLL TO DRIFT</span>
            <ChevronDown size={14} className="text-sky-400" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= SCROLL NARRATIVE LABELS ================= */}
      <div className="fixed inset-x-0 bottom-24 pointer-events-none z-20 flex items-center justify-center select-none">
        <AnimatePresence mode="wait">
          {activeSection < 7 && (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 0.8, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-1.5 px-6"
            >
              <span className="text-[10px] font-black text-sky-400 tracking-[0.4em] uppercase font-mono block">
                ACTIVE PROFILE SIGNAL
              </span>
              <h2 className="text-xl md:text-3xl font-extrabold uppercase tracking-tight text-white leading-none">
                {btsMembers[activeSection]?.fullName}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================= THE FINAL LUNAR LANDING LOGIN GATE ================= */}
      <AnimatePresence>
        {scrollProgress >= 0.80 && (() => {
          const progressRatio = Math.max(0, Math.min(1, (scrollProgress - 0.80) / 0.18)); // 0 to 1
          const blurAmount = Math.max(0, 20 - progressRatio * 20);
          const opacityAmount = progressRatio;
          const scaleAmount = 0.94 + progressRatio * 0.06;
          const isInteractive = scrollProgress >= 0.88;

          return (
            <div 
              className={`fixed inset-0 z-35 flex items-center justify-center p-6 bg-slate-950/15 backdrop-blur-[2px] transition-all duration-300 ${isInteractive ? 'pointer-events-auto' : 'pointer-events-none'}`}
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
                <div className="w-16 h-1 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 rounded-full mx-auto" />

                <div className="mx-auto w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 animate-pulse">
                  <Lock size={20} />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black tracking-[0.3em] text-sky-400 uppercase font-mono block">FINAL STAGE // MOON GATEWAY</span>
                  <h3 className="text-xl font-extrabold uppercase tracking-tight text-white">Authorized Entrance</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto font-medium">
                    Enter your corporate credentials to verify access and decrypt the Chat Igloo playground dashboard.
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
