import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ChevronDown, Compass, Lock, Eye, EyeOff, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

interface ChemistryLandingProps {
  onUnlock: (email: string) => void;
  onVerifyLogin: (email: string, pass: string) => boolean;
  darkMode: boolean;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

interface MemberProfile {
  id: number;
  stageName: string;
  fullName: string;
  position: string;
  birthday: string;
  bio: string;
  accentColor: string;
  gradient: string;
  imageFile: string;
}

export default function ChemistryLanding({ onUnlock, onVerifyLogin, darkMode }: ChemistryLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Login states
  const [localEmail, setLocalEmail] = useState('');
  const [localPassword, setLocalPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [warpActive, setWarpActive] = useState(false);
  
  // Scroll state
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);

  // Stars
  const [stars] = useState<Star[]>(() => {
    const s: Star[] = [];
    for (let i = 0; i < 200; i++) {
      s.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.5 + 0.1,
      });
    }
    return s;
  });

  // Smooth scroll interpolation
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      targetProgress.current = Math.max(0, Math.min(1, window.scrollY / scrollHeight));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let animId: number;
    const tick = () => {
      const diff = targetProgress.current - currentProgress.current;
      currentProgress.current += diff * 0.1;
      const p = currentProgress.current;
      setScrollProgress(p);

      // 8 sections: 7 members + 1 login
      const sectionCount = 8;
      setActiveSection(Math.max(0, Math.min(sectionCount - 1, Math.floor(p * sectionCount))));

      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleSectionJump = (secIndex: number) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    window.scrollTo({
      top: ((secIndex + 0.5) / 8) * scrollHeight,
      behavior: 'smooth'
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const success = onVerifyLogin(localEmail, localPassword);
    if (success) {
      setWarpActive(true);
      setTimeout(() => onUnlock(localEmail), 1200);
    } else {
      setLocalError('Invalid email or password. Access is restricted to authorized accounts.');
    }
  };

  // BTS Member data
  const btsMembers: MemberProfile[] = [
    {
      id: 0, stageName: 'RM', fullName: 'Kim Nam-joon',
      position: 'Leader, Main Rapper', birthday: 'September 12, 1994',
      bio: 'The philosophical leader and intellectual anchor of BTS. Fluent in English, RM is a prolific lyricist and producer known for his deep introspective rap style.',
      accentColor: '#38bdf8', gradient: 'radial-gradient(circle at 30% 30%, rgba(14,165,233,0.22) 0%, transparent 70%)',
      imageFile: '/bts/rm.jpg',
    },
    {
      id: 1, stageName: 'Jin', fullName: 'Kim Seok-jin',
      position: 'Sub Vocalist, Visual', birthday: 'December 4, 1992',
      bio: 'Known as "Worldwide Handsome". Jin delivers soaring, emotional high notes and brings infectious, bright energy. His solo "The Astronaut" captures his cosmic vision.',
      accentColor: '#ec4899', gradient: 'radial-gradient(circle at 70% 30%, rgba(236,72,153,0.22) 0%, transparent 70%)',
      imageFile: '/bts/jin.jpg',
    },
    {
      id: 2, stageName: 'Suga', fullName: 'Min Yoon-gi',
      position: 'Lead Rapper', birthday: 'March 9, 1993',
      bio: 'Also producing as Agust D. Suga is a powerhouse rapper, songwriter, and producer. His music is defined by raw honesty, blazing verses, and a deep connection to the piano.',
      accentColor: '#f97316', gradient: 'radial-gradient(circle at 30% 70%, rgba(249,115,22,0.22) 0%, transparent 70%)',
      imageFile: '/bts/suga.jpg',
    },
    {
      id: 3, stageName: 'J-Hope', fullName: 'Jung Ho-seok',
      position: 'Main Dancer, Sub Rapper', birthday: 'February 18, 1994',
      bio: 'The radiant "hope" and main dancer of the group. J-Hope directs the group\'s choreography with absolute precision, delivering bright, rhythmic rap flows.',
      accentColor: '#eab308', gradient: 'radial-gradient(circle at 70% 70%, rgba(234,179,8,0.22) 0%, transparent 70%)',
      imageFile: '/bts/jhope.jpg',
    },
    {
      id: 4, stageName: 'Jimin', fullName: 'Park Ji-min',
      position: 'Main Dancer, Lead Vocalist', birthday: 'October 13, 1995',
      bio: 'Renowned for his elegant modern dance styling and mesmerizing falsetto vocals. Jimin captivates stages with a unique blend of delicate grace and intense power.',
      accentColor: '#a855f7', gradient: 'radial-gradient(circle at 30% 20%, rgba(168,85,247,0.22) 0%, transparent 70%)',
      imageFile: '/bts/jimin.jpg',
    },
    {
      id: 5, stageName: 'V', fullName: 'Kim Tae-hyung',
      position: 'Lead Dancer, Sub Vocalist, Visual', birthday: 'December 30, 1995',
      bio: 'Features a soulful, deep baritone voice and striking visual charisma. V is highly artistic, drawing inspiration from retro jazz, photography, and classical art.',
      accentColor: '#10b981', gradient: 'radial-gradient(circle at 70% 80%, rgba(16,185,129,0.22) 0%, transparent 70%)',
      imageFile: '/bts/v.jpg',
    },
    {
      id: 6, stageName: 'Jungkook', fullName: 'Jeon Jung-guk',
      position: 'Main Vocalist, Lead Dancer, Center', birthday: 'September 1, 1997',
      bio: 'The "Golden Maknae" of BTS. Highly versatile, Jungkook anchors the group\'s vocals and choreography centers with powerful vocal stability and performance energy.',
      accentColor: '#f43f5e', gradient: 'radial-gradient(circle at 50% 50%, rgba(244,63,94,0.22) 0%, transparent 70%)',
      imageFile: '/bts/jungkook.jpg',
    },
  ];

  // ===== FLIGHT PATH FUNCTIONS =====
  // Each member gets a unique flight path across the viewport as their section scrolls.
  // localT goes from 0→1 within each member's scroll section.
  const getFlightPosition = (memberIdx: number, localT: number): { x: number; y: number; rotation: number; scale: number } => {
    // Clamp and ease the progress
    const t = Math.max(0, Math.min(1, localT));
    const eased = t; // linear for smooth continuous motion

    // Each member has a unique flight path style
    const paths: Array<(t: number) => { x: number; y: number; rotation: number; scale: number }> = [
      // RM: Sweeping S-curve from bottom-right to top-left
      (t) => ({
        x: 70 - t * 140, // right → left
        y: 30 * Math.sin(t * Math.PI * 2.5), // wavy up/down
        rotation: -15 + t * 30 + Math.sin(t * Math.PI * 3) * 10,
        scale: 0.6 + 0.5 * Math.sin(t * Math.PI),
      }),
      // Jin: Elegant rising arc from bottom-left
      (t) => ({
        x: -60 + t * 120 + Math.sin(t * Math.PI * 2) * 20,
        y: 40 - t * 80 + Math.sin(t * Math.PI * 3) * 15,
        rotation: 10 - t * 20,
        scale: 0.5 + 0.6 * Math.sin(t * Math.PI),
      }),
      // Suga: Figure-8 loop
      (t) => ({
        x: 50 * Math.sin(t * Math.PI * 2),
        y: 25 * Math.sin(t * Math.PI * 4),
        rotation: Math.sin(t * Math.PI * 2) * 20,
        scale: 0.55 + 0.5 * Math.sin(t * Math.PI),
      }),
      // J-Hope: Spiraling descent
      (t) => ({
        x: 45 * Math.cos(t * Math.PI * 3),
        y: -35 + t * 70,
        rotation: t * 360 * 0.15,
        scale: 0.5 + 0.55 * Math.sin(t * Math.PI),
      }),
      // Jimin: Graceful diagonal glide with barrel roll
      (t) => ({
        x: -50 + t * 100,
        y: -30 + t * 60 + Math.sin(t * Math.PI * 3) * 20,
        rotation: Math.sin(t * Math.PI * 4) * 15,
        scale: 0.55 + 0.5 * Math.sin(t * Math.PI),
      }),
      // V: Lazy orbit around center
      (t) => ({
        x: 40 * Math.cos(t * Math.PI * 2 + Math.PI / 4),
        y: 30 * Math.sin(t * Math.PI * 2 + Math.PI / 4),
        rotation: -10 + Math.sin(t * Math.PI * 2) * 15,
        scale: 0.55 + 0.5 * Math.sin(t * Math.PI),
      }),
      // Jungkook: Dynamic swooping dive
      (t) => ({
        x: 55 * Math.sin(t * Math.PI * 2.5),
        y: -35 * Math.cos(t * Math.PI * 2) + t * 20,
        rotation: Math.cos(t * Math.PI * 3) * 20,
        scale: 0.5 + 0.6 * Math.sin(t * Math.PI),
      }),
    ];

    return paths[memberIdx](eased);
  };

  // Calculate current member's flight data
  const getMemberVisuals = (memberIdx: number) => {
    const sectionStart = memberIdx / 8;
    const sectionEnd = (memberIdx + 1) / 8;
    const sectionLength = sectionEnd - sectionStart;
    
    // Local progress within this member's section (0 to 1)
    const localT = Math.max(0, Math.min(1, (scrollProgress - sectionStart) / sectionLength));
    
    // Visibility: fade in at start of section, fade out at end
    let opacity = 0;
    if (scrollProgress >= sectionStart - 0.02 && scrollProgress <= sectionEnd + 0.02) {
      const fadeInEnd = sectionStart + sectionLength * 0.15;
      const fadeOutStart = sectionEnd - sectionLength * 0.15;
      
      if (scrollProgress < fadeInEnd) {
        opacity = Math.max(0, (scrollProgress - (sectionStart - 0.02)) / (fadeInEnd - sectionStart + 0.02));
      } else if (scrollProgress > fadeOutStart) {
        opacity = Math.max(0, (sectionEnd + 0.02 - scrollProgress) / (sectionEnd + 0.02 - fadeOutStart));
      } else {
        opacity = 1;
      }
    }

    const flight = getFlightPosition(memberIdx, localT);
    
    return { opacity, localT, ...flight };
  };

  // Altitude readout
  const currentAltitude = Math.max(0, Math.floor(384400 * (1 - scrollProgress)));

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[600vh] w-full bg-[#020410] text-slate-100 font-sans selection:bg-indigo-500/20 overflow-x-hidden"
    >
      {/* ========== FIXED VIEWPORT ========== */}
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0">
        {/* Deep space background */}
        <div className="absolute inset-0 bg-[#020410]" />

        {/* Dynamic nebula backgrounds per member */}
        {btsMembers.map((m, idx) => {
          const centerRatio = (idx + 0.5) / 8;
          const distance = Math.abs(scrollProgress - centerRatio);
          const opacity = Math.max(0, 1 - distance * 6);
          return (
            <div
              key={m.id}
              className="absolute inset-0 pointer-events-none mix-blend-screen"
              style={{ background: m.gradient, opacity }}
            />
          );
        })}

        {/* Subtle space ambient for login section */}
        {scrollProgress >= 0.8 && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(148,163,184,0.06) 0%, transparent 80%)',
              opacity: Math.min(1, (scrollProgress - 0.8) * 5),
            }}
          />
        )}

        {/* ===== STAR FIELD ===== */}
        {stars.map((star) => {
          // Parallax: stars drift upward as user scrolls
          const yShift = (scrollProgress * star.speed * 200) % 100;
          const adjustedY = ((star.y - yShift) % 100 + 100) % 100;
          return (
            <div
              key={star.id}
              className="absolute rounded-full bg-white pointer-events-none"
              style={{
                left: `${star.x}%`,
                top: `${adjustedY}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                boxShadow: star.size > 2 ? '0 0 4px rgba(255,255,255,0.6)' : 'none',
              }}
            />
          );
        })}

        {/* ===== FLYING BTS MEMBERS ===== */}
        {btsMembers.map((member, idx) => {
          const vis = getMemberVisuals(idx);
          if (vis.opacity <= 0.01) return null;

          return (
            <div
              key={member.id}
              className="absolute pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${vis.x}vw), calc(-50% + ${vis.y}vh)) rotate(${vis.rotation}deg) scale(${vis.scale})`,
                opacity: vis.opacity,
                transition: 'opacity 0.15s ease-out',
                willChange: 'transform, opacity',
                zIndex: 10,
              }}
            >
              {/* Photo in glowing circular frame */}
              <div
                className="relative"
                style={{
                  width: '280px',
                  height: '280px',
                }}
              >
                {/* Outer glow ring */}
                <div
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    boxShadow: `0 0 50px ${member.accentColor}44, 0 0 100px ${member.accentColor}22, inset 0 0 30px ${member.accentColor}22`,
                    border: `2px solid ${member.accentColor}55`,
                  }}
                />
                {/* Photo */}
                <img
                  src={member.imageFile}
                  alt={`${member.stageName} flying`}
                  className="absolute inset-0 w-full h-full rounded-full object-cover"
                  style={{
                    border: `3px solid ${member.accentColor}88`,
                    filter: 'drop-shadow(0 0 25px rgba(0,0,0,0.8))',
                  }}
                />
                {/* Name badge floating below */}
                <div
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
                  style={{
                    background: `${member.accentColor}22`,
                    border: `1px solid ${member.accentColor}66`,
                    borderRadius: '9999px',
                    padding: '4px 14px',
                  }}
                >
                  <span className="text-[11px] font-black tracking-[0.2em] text-white uppercase font-mono">
                    {member.stageName}
                  </span>
                </div>
                {/* Speed trail effect */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(${vis.rotation + 180}deg, transparent 40%, ${member.accentColor}15 70%, ${member.accentColor}08 100%)`,
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* ===== PROFILE CARDS (centered, below the flying member) ===== */}
        {btsMembers.map((member, idx) => {
          const vis = getMemberVisuals(idx);
          if (vis.opacity <= 0.01) return null;

          // Card position: centered but offset opposite to fly direction
          const cardX = -vis.x * 0.15;
          const cardY = 15 - vis.y * 0.1;

          return (
            <div
              key={`card-${member.id}`}
              className="absolute pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${cardX}vw), calc(-50% + ${cardY}vh))`,
                opacity: vis.opacity * 0.95,
                transition: 'opacity 0.2s ease-out',
                willChange: 'transform, opacity',
                zIndex: 5,
              }}
            >
              <div className="w-[90vw] max-w-lg flex flex-col md:flex-row items-center gap-5 md:gap-8 p-6 md:p-8 rounded-[28px] bg-slate-950/50 border border-slate-800/60 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.5)] select-none">
                {/* Member mini avatar */}
                <div
                  className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl overflow-hidden border-2 shadow-lg"
                  style={{ borderColor: `${member.accentColor}66` }}
                >
                  <img
                    src={member.imageFile}
                    alt={member.stageName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Profile text */}
                <div className="flex-1 text-left space-y-2.5">
                  <div className="space-y-1">
                    <span
                      style={{ color: member.accentColor }}
                      className="text-[9px] font-black uppercase tracking-[0.25em] font-mono block"
                    >
                      MEMBER 0{member.id + 1} // BTS PROFILE
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none">
                      {member.stageName}
                    </h2>
                    <p className="text-xs text-slate-400 font-bold">{member.fullName}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-800">{member.position}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-800">{member.birthday}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    {member.bio}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* ===== MOON SVG (appears at end) ===== */}
        {scrollProgress >= 0.78 && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: Math.min(1, (scrollProgress - 0.78) * 5),
              zIndex: 2,
            }}
          >
            <svg viewBox="0 0 500 500" className="w-[350px] h-[350px] md:w-[450px] md:h-[450px] drop-shadow-[0_0_80px_rgba(241,245,249,0.15)]">
              <defs>
                <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="85%" stopColor="rgba(226, 232, 240, 0)" />
                  <stop offset="94%" stopColor="rgba(226, 232, 240, 0.12)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.25)" />
                </radialGradient>
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

      {/* ========== FIXED HEADER ========== */}
      <header className="fixed top-0 left-0 w-full p-6 md:p-8 flex items-center justify-between z-[45] select-none pointer-events-none">
        <div className="flex flex-col text-left pointer-events-auto cursor-pointer" onClick={() => handleSectionJump(0)}>
          <span className="text-[20px] font-black tracking-[0.16em] text-white uppercase font-sans">
            IGLOO
          </span>
          <span className="text-[8px] font-bold text-sky-400 tracking-[0.4em] uppercase font-mono mt-0.5">
            DESIGN LAB
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono pointer-events-auto">
          <button onClick={() => handleSectionJump(0)} className={`hover:text-white transition-colors cursor-pointer ${activeSection < 7 ? 'text-sky-400' : ''}`}>01 / BTS FLIGHT</button>
          <button onClick={() => handleSectionJump(7)} className={`hover:text-white transition-colors cursor-pointer ${activeSection === 7 ? 'text-sky-400' : ''}`}>02 / LUNAR INGRESS</button>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-full text-[9px] font-black text-sky-400 tracking-wider flex items-center gap-1.5 shadow-md">
            <Shield size={10} className="animate-pulse" />
            <span>SECURE GATEWAY ACTIVE</span>
          </div>
        </div>
      </header>

      {/* ========== TELEMETRY ========== */}
      <div className="fixed left-6 md:left-8 bottom-8 z-30 select-none font-mono text-[9px] text-slate-500 tracking-widest hidden md:flex flex-col gap-1.5 leading-none pointer-events-none text-left">
        <div className="flex items-center gap-1.5">
          <Compass size={11} className="text-sky-500" />
          <span>ALTITUDE: {currentAltitude.toLocaleString()} KM</span>
        </div>
        <div>VELOCITY: {Math.floor(11.2 * (1 + scrollProgress * 5.5))} KM/S</div>
        <div>ACTIVE: {activeSection === 7 ? 'MOON GATE' : btsMembers[activeSection]?.stageName || 'RM'}</div>
        <div>MANEUVER: SPIRAL ORBIT</div>
      </div>

      {/* ========== RIGHT SCROLL DOT NAV ========== */}
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
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'scale-150 ring-4' : 'bg-slate-700 group-hover:bg-slate-400'}`}
                style={{ backgroundColor: isActive ? m.accentColor : undefined, '--tw-ring-color': isActive ? `${m.accentColor}33` : undefined } as any}
              />
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

      {/* ========== SCROLL INDICATOR ========== */}
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

      {/* ========== ACTIVE MEMBER LABEL (bottom center) ========== */}
      <div className="fixed inset-x-0 bottom-20 pointer-events-none z-20 flex items-center justify-center select-none">
        <AnimatePresence mode="wait">
          {activeSection < 7 && (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 0.8, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
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

      {/* ========== LOGIN GATE ========== */}
      <AnimatePresence>
        {scrollProgress >= 0.80 && (() => {
          const progressRatio = Math.max(0, Math.min(1, (scrollProgress - 0.80) / 0.18));
          const blurAmount = Math.max(0, 20 - progressRatio * 20);
          const opacityAmount = progressRatio;
          const scaleAmount = 0.94 + progressRatio * 0.06;
          const isInteractive = scrollProgress >= 0.88;

          return (
            <div
              className={`fixed inset-0 z-[35] flex items-center justify-center p-6 bg-slate-950/15 backdrop-blur-[2px] transition-all duration-300 ${isInteractive ? 'pointer-events-auto' : 'pointer-events-none'}`}
              style={{
                filter: `blur(${blurAmount}px)`,
                opacity: opacityAmount,
              }}
            >
              <motion.div
                style={{ transform: `scale(${scaleAmount})` }}
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

      {/* Warp transition */}
      <AnimatePresence>
        {warpActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white pointer-events-none z-[100] flex flex-col items-center justify-center text-slate-950 font-black text-3xl tracking-[0.2em]"
            style={{ mixBlendMode: 'difference' }}
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
