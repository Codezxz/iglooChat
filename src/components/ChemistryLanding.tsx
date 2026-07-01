import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ChevronDown, Cpu, Compass, Play, RefreshCw, Key, LogIn, ArrowRight, AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react';

interface ChemistryLandingProps {
  onUnlock: (email: string) => void;
  onVerifyLogin: (email: string, pass: string) => boolean;
  darkMode: boolean;
}

// 3D coordinate point definition
interface Point3D {
  x: number;
  y: number;
  z: number;
}

// 3D face structure for polygons
interface Face3D {
  indices: number[];
  color: string;
  outlineColor?: string;
  isGlass?: boolean;
}

// Particle for snow and fog
interface WeatherParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  speedMultiplier: number;
}

// Scattered properties for cryo ice bricks
interface ScatteredBrick {
  id: number;
  scatterPos: Point3D;
  scatterRot: Point3D;
  targetPos: Point3D;
  targetRot: Point3D;
  size: Point3D;
}

export default function ChemistryLanding({ onUnlock, onVerifyLogin, darkMode }: ChemistryLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Local login states
  const [localEmail, setLocalEmail] = useState('');
  const [localPassword, setLocalPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Custom smooth scroll state
  const [scrollProgress, setScrollProgress] = useState(0);
  const targetScrollProgress = useRef(0);
  const currentScrollProgress = useRef(0);

  const [hasEntered, setHasEntered] = useState(false);
  const [warpActive, setWarpActive] = useState(false);

  // Layout states for tracking active sections
  const [activeSection, setActiveSection] = useState(0);

  // Ref to hold all generated 3D elements to avoid recreating them
  const elementsRef = useRef<{
    ringBricks: { vertices: Point3D[]; faces: Face3D[]; baseRot: Point3D }[];
    iglooBricks: ScatteredBrick[];
    monolithVertices: Point3D[];
    monolithFaces: Face3D[];
    weather: WeatherParticle[];
  } | null>(null);

  // Initialize the 3D assets once
  useEffect(() => {
    if (elementsRef.current) return;

    // 1. Create Segments of the Solidus Core Ring
    const ringBricks: { vertices: Point3D[]; faces: Face3D[]; baseRot: Point3D }[] = [];
    const ringSegmentsCount = 10;
    const ringRadius = 140;

    for (let s = 0; s < ringSegmentsCount; s++) {
      const angleStart = (s / ringSegmentsCount) * Math.PI * 2;
      const angleEnd = ((s + 0.85) / ringSegmentsCount) * Math.PI * 2; // Slight spacing

      // Create a 3D block curved along the circle
      const rInner = ringRadius - 18;
      const rOuter = ringRadius + 18;
      const hHalf = 16; // Half-height of the ring

      // 8 vertices for a 3D block
      // Z coordinates are depth
      const rawVertices: Point3D[] = [
        // Front face (z = -hHalf)
        { x: rInner * Math.cos(angleStart), y: rInner * Math.sin(angleStart), z: -hHalf },
        { x: rOuter * Math.cos(angleStart), y: rOuter * Math.sin(angleStart), z: -hHalf },
        { x: rOuter * Math.cos(angleEnd), y: rOuter * Math.sin(angleEnd), z: -hHalf },
        { x: rInner * Math.cos(angleEnd), y: rInner * Math.sin(angleEnd), z: -hHalf },
        // Back face (z = hHalf)
        { x: rInner * Math.cos(angleStart), y: rInner * Math.sin(angleStart), z: hHalf },
        { x: rOuter * Math.cos(angleStart), y: rOuter * Math.sin(angleStart), z: hHalf },
        { x: rOuter * Math.cos(angleEnd), y: rOuter * Math.sin(angleEnd), z: hHalf },
        { x: rInner * Math.cos(angleEnd), y: rInner * Math.sin(angleEnd), z: hHalf },
      ];

      // Define 6 faces (quads) with beautiful high-tech dark steel & neon colors
      const faces: Face3D[] = [
        { indices: [0, 1, 2, 3], color: 'rgba(30, 41, 59, 0.9)', outlineColor: '#38bdf8' }, // Front
        { indices: [4, 5, 6, 7], color: 'rgba(15, 23, 42, 0.95)', outlineColor: '#0ea5e9' }, // Back
        { indices: [0, 1, 5, 4], color: 'rgba(51, 65, 85, 0.85)', outlineColor: '#0284c7' }, // Side 1
        { indices: [2, 3, 7, 6], color: 'rgba(51, 65, 85, 0.85)', outlineColor: '#0284c7' }, // Side 2
        { indices: [1, 2, 6, 5], color: 'rgba(15, 23, 42, 0.9)', outlineColor: '#38bdf8' }, // Outer curve
        { indices: [0, 3, 7, 4], color: 'rgba(30, 41, 59, 0.9)', outlineColor: '#0ea5e9' }, // Inner curve
      ];

      ringBricks.push({
        vertices: rawVertices,
        faces,
        baseRot: { x: angleStart, y: 0, z: 0 }
      });
    }

    // 2. Create detailed 3D Igloo Bricks (Dome hemisphere structure)
    const iglooBricks: ScatteredBrick[] = [];
    let brickId = 0;
    const iglooRadius = 130;
    const brickHeight = 16;
    const brickDepth = 18;
    const tiersCount = 5;

    for (let tier = 0; tier < tiersCount; tier++) {
      const phi = (tier / (tiersCount - 0.2)) * (Math.PI / 2); // angle up from floor
      const tierRadius = iglooRadius * Math.cos(phi);
      const tierY = iglooRadius * Math.sin(phi) - 40; // centered vertically

      // Bricks per row decreases as we go up
      const circumference = 2 * Math.PI * tierRadius;
      const brickWidth = 32;
      const bricksCount = Math.max(4, Math.floor(circumference / brickWidth));

      for (let b = 0; b < bricksCount; b++) {
        // Skip some bricks at the bottom-front to create an entrance tunnel
        const angle = (b / bricksCount) * Math.PI * 2;
        const isEntranceAngle = angle > Math.PI * 0.35 && angle < Math.PI * 0.65;
        if (tier <= 1 && isEntranceAngle) continue;

        const targetX = tierRadius * Math.cos(angle);
        const targetZ = tierRadius * Math.sin(angle);

        // Generate scattered cryo position (flying in from atmospheric void)
        const scatterDistance = 450 + Math.random() * 300;
        const scatterAngle = Math.random() * Math.PI * 2;
        const scatterElevation = (Math.random() - 0.3) * Math.PI;

        const scatterPos: Point3D = {
          x: scatterDistance * Math.cos(scatterElevation) * Math.cos(scatterAngle),
          y: scatterDistance * Math.sin(scatterElevation) - 100,
          z: scatterDistance * Math.cos(scatterElevation) * Math.sin(scatterAngle),
        };

        const scatterRot: Point3D = {
          x: (Math.random() - 0.5) * Math.PI * 4,
          y: (Math.random() - 0.5) * Math.PI * 4,
          z: (Math.random() - 0.5) * Math.PI * 4,
        };

        const targetRot: Point3D = {
          x: 0,
          y: -angle + Math.PI / 2, // Rotate to align radially
          z: phi, // Lean inward
        };

        iglooBricks.push({
          id: brickId++,
          scatterPos,
          scatterRot,
          targetPos: { x: targetX, y: tierY, z: targetZ },
          targetRot,
          size: { x: 26, y: brickHeight, z: brickDepth }
        });
      }
    }

    // Add explicit entrance tunnel arch bricks to make the igloo incredibly polished
    const tunnelAngles = [Math.PI * 0.36, Math.PI * 0.43, Math.PI * 0.50, Math.PI * 0.57, Math.PI * 0.64];
    tunnelAngles.forEach((angle, i) => {
      // Create lower and upper tunnel arch bricks stretching forward
      const extendDist = 35; // Forward extension
      const targetX = (iglooRadius - 5) * Math.cos(angle);
      const targetZ = (iglooRadius - 5) * Math.sin(angle);
      const tunnelY = -35 + (i === 2 ? 18 : i === 1 || i === 3 ? 12 : 0); // Arch curvature

      const scatterDistance = 600 + Math.random() * 200;
      const scatterAngle = Math.random() * Math.PI * 2;
      const scatterPos = {
        x: scatterDistance * Math.cos(scatterAngle),
        y: (Math.random() - 0.5) * 400,
        z: scatterDistance * Math.sin(scatterAngle)
      };

      iglooBricks.push({
        id: brickId++,
        scatterPos,
        scatterRot: { x: Math.random() * 5, y: Math.random() * 5, z: Math.random() * 5 },
        targetPos: { x: targetX * 1.15, y: tunnelY, z: targetZ * 1.15 },
        targetRot: { x: 0, y: -angle + Math.PI/2, z: 0 },
        size: { x: 20, y: 14, z: 24 }
      });
    });

    // 3. Create high-tech 3D Low-Poly Monolith
    const monolithVertices: Point3D[] = [
      { x: 0, y: 150, z: 0 }, // Top peak [0]
      { x: -50, y: 60, z: -40 }, // Upper ring [1]
      { x: 50, y: 60, z: -40 },  // [2]
      { x: 60, y: 60, z: 40 },   // [3]
      { x: -60, y: 60, z: 40 },  // [4]
      { x: -70, y: -80, z: -50 }, // Lower ring [5]
      { x: 70, y: -80, z: -50 },  // [6]
      { x: 80, y: -80, z: 50 },   // [7]
      { x: -80, y: -80, z: 50 },  // [8]
      { x: 0, y: -160, z: 0 }, // Bottom peak [9]
    ];

    const monolithFaces: Face3D[] = [
      // Top Pyramids
      { indices: [0, 1, 2], color: 'rgba(30, 41, 59, 0.95)', outlineColor: '#38bdf8' },
      { indices: [0, 2, 3], color: 'rgba(15, 23, 42, 0.95)', outlineColor: '#0ea5e9' },
      { indices: [0, 3, 4], color: 'rgba(30, 41, 59, 0.95)', outlineColor: '#38bdf8' },
      { indices: [0, 4, 1], color: 'rgba(15, 23, 42, 0.95)', outlineColor: '#0ea5e9' },
      // Mid walls
      { indices: [1, 2, 6, 5], color: 'rgba(15, 23, 42, 0.9)', outlineColor: '#0284c7' },
      { indices: [2, 3, 7, 6], color: 'rgba(30, 41, 59, 0.85)', outlineColor: '#0ea5e9' },
      { indices: [3, 4, 8, 7], color: 'rgba(15, 23, 42, 0.9)', outlineColor: '#0284c7' },
      { indices: [4, 1, 5, 8], color: 'rgba(30, 41, 59, 0.85)', outlineColor: '#38bdf8' },
      // Bottom Pyramids
      { indices: [9, 5, 6], color: 'rgba(15, 23, 42, 0.95)', outlineColor: '#0284c7' },
      { indices: [9, 6, 7], color: 'rgba(30, 41, 59, 0.95)', outlineColor: '#0ea5e9' },
      { indices: [9, 7, 8], color: 'rgba(15, 23, 42, 0.95)', outlineColor: '#0284c7' },
      { indices: [9, 8, 5], color: 'rgba(30, 41, 59, 0.95)', outlineColor: '#38bdf8' },
    ];

    // 4. Weather simulation (misty particles and snow)
    const weather: WeatherParticle[] = [];
    for (let i = 0; i < 220; i++) {
      weather.push({
        x: (Math.random() - 0.5) * 1100,
        y: (Math.random() - 0.5) * 800,
        z: Math.random() * 800,
        vx: (Math.random() - 0.5) * 1.5 - 0.6, // slight left-drift
        vy: Math.random() * 1.8 + 0.8, // downward falling speed
        size: Math.random() * 2.5 + 0.8,
        opacity: Math.random() * 0.75 + 0.15,
        speedMultiplier: Math.random() * 0.6 + 0.7
      });
    }

    elementsRef.current = {
      ringBricks,
      iglooBricks,
      monolithVertices,
      monolithFaces,
      weather
    };
  }, []);

  // Set up natural window scroll listeners that map scroll offset to progress (0 to 1)
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

  // Main high-performance drawing loop with LERP smooth scroll easing
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localRotationY = 0; // Ambient rotation
    let frame = 0;

    const renderLoop = () => {
      frame++;
      
      // 1. Calculate lerped smooth scroll progress (buttery smooth kinetic motion)
      const diff = targetScrollProgress.current - currentScrollProgress.current;
      currentScrollProgress.current += diff * 0.085; // Easing constant
      const progress = currentScrollProgress.current;
      setScrollProgress(progress);

      // Map scroll progress to sections
      if (progress < 0.28) {
        setActiveSection(0);
      } else if (progress < 0.62) {
        setActiveSection(1);
      } else if (progress < 0.88) {
        setActiveSection(2);
      } else {
        setActiveSection(3);
      }

      // 2. Adjust Canvas layout to fit physical screen size
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
      }

      // Clear with dark atmospheric gradient
      ctx.fillStyle = '#0a0d18'; // Deep space dark slate blue
      ctx.fillRect(0, 0, w, h);

      // Render radial glow backdrops
      const gradBg = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, Math.max(w, h) * 0.7);
      gradBg.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
      gradBg.addColorStop(0.5, 'rgba(10, 13, 24, 0.95)');
      gradBg.addColorStop(1, '#05070f');
      ctx.fillStyle = gradBg;
      ctx.fillRect(0, 0, w, h);

      // Draw subtle horizon mist gradient
      const horizonGrad = ctx.createLinearGradient(0, h * 0.4, 0, h);
      horizonGrad.addColorStop(0, 'rgba(14, 165, 233, 0.0)');
      horizonGrad.addColorStop(0.65, 'rgba(14, 165, 233, 0.04)');
      horizonGrad.addColorStop(0.85, 'rgba(56, 189, 248, 0.08)');
      horizonGrad.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
      ctx.fillStyle = horizonGrad;
      ctx.fillRect(0, h * 0.4, w, h * 0.6);

      // Camera focal point and coordinates
      const cx = w / 2;
      const cy = h / 2 - 20;
      const fov = 380; // Perspective zoom intensity

      // Ambient drift rotations
      localRotationY += 0.005;
      const ambientOsc = Math.sin(frame * 0.015) * 8; // gentle float

      const assets = elementsRef.current;
      if (!assets) {
        animId = requestAnimationFrame(renderLoop);
        return;
      }

      // --- HELPER PERSPECTIVE PROJECTION & 3D ROTATION ---
      const project = (p: Point3D, rx: number, ry: number, rz: number, translation: Point3D) => {
        // Rotations
        // X-axis
        const cosX = Math.cos(rx), sinX = Math.sin(rx);
        let y1 = p.y * cosX - p.z * sinX;
        let z1 = p.y * sinX + p.z * cosX;

        // Y-axis
        const cosY = Math.cos(ry), sinY = Math.sin(ry);
        let x2 = p.x * cosY + z1 * sinY;
        let z2 = -p.x * sinY + z1 * cosY;

        // Z-axis
        const cosZ = Math.cos(rz), sinZ = Math.sin(rz);
        let x3 = x2 * cosZ - y1 * sinZ;
        let y3 = x2 * sinZ + y1 * cosZ;

        // Translation
        const finalX = x3 + translation.x;
        const finalY = y3 + translation.y;
        const finalZ = z2 + translation.z;

        // Perspective Projection
        const scale = fov / Math.max(1, fov + finalZ);
        return {
          x: cx + finalX * scale,
          y: cy + finalY * scale,
          z: finalZ,
          scale
        };
      };

      // Draw horizontal target grids under elements (Cyberpunk tech radar)
      const drawGrid = (yFloor: number, alphaMultiplier: number) => {
        ctx.save();
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 * alphaMultiplier})`;
        ctx.lineWidth = 1;
        const gridR = 180;
        
        for (let r = 1; r <= 4; r++) {
          const currentR = gridR * (r / 4);
          ctx.beginPath();
          // Draw a 3D circle on the floor
          for (let a = 0; a <= 36; a++) {
            const angle = (a / 36) * Math.PI * 2;
            const px = currentR * Math.cos(angle);
            const pz = currentR * Math.sin(angle);
            const proj = project({ x: px, y: yFloor, z: pz }, 0.4, localRotationY * 0.4, 0, { x: 0, y: 30, z: 120 });
            if (a === 0) ctx.moveTo(proj.x, proj.y);
            else ctx.lineTo(proj.x, proj.y);
          }
          ctx.stroke();
        }

        // Draw cross lines
        for (let l = 0; l < 8; l++) {
          const angle = (l / 8) * Math.PI * 2;
          const projStart = project({ x: 0, y: yFloor, z: 0 }, 0.4, localRotationY * 0.4, 0, { x: 0, y: 30, z: 120 });
          const projEnd = project({ x: gridR * Math.cos(angle), y: yFloor, z: gridR * Math.sin(angle) }, 0.4, localRotationY * 0.4, 0, { x: 0, y: 30, z: 120 });
          ctx.beginPath();
          ctx.moveTo(projStart.x, projStart.y);
          ctx.lineTo(projEnd.x, projEnd.y);
          ctx.stroke();
        }
        ctx.restore();
      };

      // Render 3D Scene Elements based on scroll phase
      
      // ================= SECTION 1: SOLIDUS CORE RING (Progress 0.0 to 0.4) =================
      if (progress < 0.45) {
        // Fade out ring as we transition to igloo
        const sectionAlpha = Math.max(0, Math.min(1, (0.4 - progress) / 0.1));
        drawGrid(110, sectionAlpha);

        // Ring explosion/disassembly progress
        // 0 to 0.15: assembled
        // 0.15 to 0.40: explode outwards, rotation speeds up, zoom toward screen
        const explodeFactor = progress < 0.12 ? 0 : Math.pow((progress - 0.12) / 0.28, 1.6);
        const ringRotationSpeed = localRotationY * 0.7 + progress * 4.5;

        // Render each segment
        assets.ringBricks.forEach((brick, index) => {
          // Add explosive displacement vector
          const displaceAngle = brick.baseRot.x;
          // Segments fly outward, down/up, and zoom dynamically forward in Z depth
          const dispX = Math.cos(displaceAngle) * explodeFactor * 260;
          const dispY = Math.sin(displaceAngle) * explodeFactor * 90 + explodeFactor * -50;
          const dispZ = explodeFactor * -320; // fly towards the lens

          const translation: Point3D = {
            x: dispX,
            y: dispY + ambientOsc,
            z: 100 + dispZ
          };

          // Individual segment spin on explosion
          const localRotX = explodeFactor * index * 1.5 + 0.3;
          const localRotY = ringRotationSpeed;
          const localRotZ = explodeFactor * index * 0.8;

          // Projected vertices
          const projPoints = brick.vertices.map((v) =>
            project(v, localRotX, localRotY, localRotZ, translation)
          );

          // Render faces with depth sorting (crude back-to-front painter's algorithm)
          // Compute average Z of faces for sorting
          const faceZAndIndex = brick.faces.map((face, fIdx) => {
            const avgZ = face.indices.reduce((sum, idx) => sum + projPoints[idx].z, 0) / face.indices.length;
            return { fIdx, avgZ };
          });

          // Sort back to front (highest z is deepest in screen)
          faceZAndIndex.sort((a, b) => b.avgZ - a.avgZ);

          faceZAndIndex.forEach(({ fIdx }) => {
            const face = brick.faces[fIdx];
            ctx.save();
            ctx.globalAlpha = sectionAlpha;

            // Apply lens defocus/blur on elements zooming extremely close to the lens (z < -100)
            const minZ = Math.min(...projPoints.map(p => p.z));
            if (minZ < -150) {
              const blurAmt = Math.min(12, Math.abs(minZ + 150) / 15);
              ctx.filter = `blur(${blurAmt}px)`;
            }

            // Draw face
            ctx.beginPath();
            face.indices.forEach((vIdx, step) => {
              const pt = projPoints[vIdx];
              if (step === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();

            // Glass/Metal shading gradient
            const firstPt = projPoints[face.indices[0]];
            const grad = ctx.createLinearGradient(firstPt.x - 30, firstPt.y - 30, firstPt.x + 40, firstPt.y + 40);
            grad.addColorStop(0, face.color);
            grad.addColorStop(1, 'rgba(8, 47, 73, 0.6)'); // deep oceanic cyber steel overlay
            ctx.fillStyle = grad;
            ctx.fill();

            // Glow outlines
            ctx.strokeStyle = face.outlineColor || '#38bdf8';
            ctx.lineWidth = 1.4;
            ctx.stroke();

            ctx.restore();
          });
        });

        // Glowing center core pulse (The Solidus Reactor)
        if (progress < 0.3) {
          ctx.save();
          ctx.globalAlpha = (1 - progress * 3) * sectionAlpha;
          const glowProj = project({ x: 0, y: 0, z: 0 }, 0, 0, 0, { x: 0, y: ambientOsc, z: 100 });
          const glowSize = Math.max(10, 48 * (1 + Math.sin(frame * 0.08) * 0.1));

          const rGlow = ctx.createRadialGradient(glowProj.x, glowProj.y, 2, glowProj.x, glowProj.y, glowSize);
          rGlow.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
          rGlow.addColorStop(0.35, 'rgba(56, 189, 248, 0.8)');
          rGlow.addColorStop(0.7, 'rgba(14, 165, 233, 0.25)');
          rGlow.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = rGlow;
          ctx.beginPath();
          ctx.arc(glowProj.x, glowProj.y, glowSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // ================= SECTION 2: CRYO IGLOO ASSEMBLY (Progress 0.25 to 0.75) =================
      if (progress >= 0.25 && progress < 0.78) {
        // Fade in/out factor
        let sectionAlpha = 1.0;
        if (progress < 0.35) {
          sectionAlpha = (progress - 0.25) / 0.1; // Fade in
        } else if (progress > 0.68) {
          sectionAlpha = Math.max(0, (0.78 - progress) / 0.1); // Fade out
        }

        // Floor ground circle shadow
        ctx.save();
        ctx.globalAlpha = sectionAlpha;
        const groundProj = project({ x: 0, y: 40, z: 0 }, 0.2, localRotationY * 0.15, 0, { x: 0, y: 10, z: 150 });
        const groundGrad = ctx.createRadialGradient(groundProj.x, groundProj.y, 10, groundProj.x, groundProj.y, 170);
        groundGrad.addColorStop(0, 'rgba(14, 165, 233, 0.15)');
        groundGrad.addColorStop(0.6, 'rgba(15, 23, 42, 0.3)');
        groundGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = groundGrad;
        ctx.beginPath();
        ctx.arc(groundProj.x, groundProj.y, 170, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();

        // Assembly factor maps from 0.32 to 0.62
        const assemblyProgress = Math.max(0, Math.min(1, (progress - 0.32) / 0.30));

        // Let's render the detailed ice blocks
        // Sort blocks back-to-front so translucent blocks render perfectly
        const projectedBricks = assets.iglooBricks.map((brick) => {
          // Lerp position & rotation from scattered cryo storm to structured igloo base
          // We'll use a beautiful smooth cubic ease-out so they lock in sequence
          // Give lower bricks a slight headstart so it builds bottom-up!
          const brickDelay = (brick.targetPos.y + 45) / 110; // lower elements have higher values (targetPos.y goes from -40 base to +80 dome)
          // Adjust ease timing based on vertical tier
          const blockProgress = Math.max(0, Math.min(1, (assemblyProgress * 1.3) - (brickDelay * 0.35)));
          
          // Smooth cubic ease out
          const tEase = 1 - Math.pow(1 - blockProgress, 3);

          const currentX = brick.scatterPos.x + (brick.targetPos.x - brick.scatterPos.x) * tEase;
          const currentY = brick.scatterPos.y + (brick.targetPos.y - brick.scatterPos.y) * tEase;
          const currentZ = brick.scatterPos.z + (brick.targetPos.z - brick.scatterPos.z) * tEase;

          const rotX = brick.scatterRot.x + (brick.targetRot.x - brick.scatterRot.x) * tEase;
          const rotY = brick.scatterRot.y + (brick.targetRot.y - brick.scatterRot.y) * tEase;
          const rotZ = brick.scatterRot.z + (brick.targetRot.z - brick.scatterRot.z) * tEase;

          // Compute brick local vertices relative to its center
          const sx = brick.size.x / 2;
          const sy = brick.size.y / 2;
          const sz = brick.size.z / 2;

          const localVertices: Point3D[] = [
            { x: -sx, y: -sy, z: -sz }, { x: sx, y: -sy, z: -sz },
            { x: sx, y: sy, z: -sz }, { x: -sx, y: sy, z: -sz },
            { x: -sx, y: -sy, z: sz }, { x: sx, y: -sy, z: sz },
            { x: sx, y: sy, z: sz }, { x: -sx, y: sy, z: sz },
          ];

          // Overall global camera orbit
          const globalTranslation: Point3D = {
            x: currentX,
            y: currentY + ambientOsc * 0.4,
            z: 140 + currentZ
          };

          const projPts = localVertices.map((lv) =>
            project(lv, rotX, rotY + localRotationY * 0.3, rotZ, globalTranslation)
          );

          // Define standard 3D cube faces
          const brickFaces = [
            [0, 1, 2, 3], // Front
            [4, 5, 6, 7], // Back
            [0, 1, 5, 4], // Bottom
            [2, 3, 7, 6], // Top
            [1, 2, 6, 5], // Right
            [0, 3, 7, 4], // Left
          ];

          // Compute centroid Z for sorting
          const avgZ = projPts.reduce((sum, p) => sum + p.z, 0) / projPts.length;

          return {
            id: brick.id,
            points: projPts,
            faces: brickFaces,
            avgZ,
            opacity: blockProgress // fully assembled cubes are solid, coming-in are semi-ghostly
          };
        });

        // Depth sort back to front (descending order of avgZ)
        projectedBricks.sort((a, b) => b.avgZ - a.avgZ);

        // Draw the ice blocks
        projectedBricks.forEach((brick) => {
          brick.faces.forEach((indices) => {
            ctx.save();
            ctx.globalAlpha = sectionAlpha * Math.max(0.15, brick.opacity);

            ctx.beginPath();
            indices.forEach((idx, step) => {
              const pt = brick.points[idx];
              if (step === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();

            // Dynamic glacial lighting based on rotation
            // Translucent glowing ice look
            const firstPt = brick.points[indices[0]];
            const iceGrad = ctx.createLinearGradient(firstPt.x - 10, firstPt.y - 10, firstPt.x + 20, firstPt.y + 20);
            iceGrad.addColorStop(0, 'rgba(186, 230, 253, 0.35)'); // frosty light blue
            iceGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.25)'); // deep neon cyan
            iceGrad.addColorStop(1, 'rgba(2, 132, 199, 0.45)'); // glassy core blue
            ctx.fillStyle = iceGrad;
            ctx.fill();

            // Soft white ice edge highlight
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * brick.opacity + 0.1})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();

            ctx.restore();
          });
        });

        // Cozy amber fire light glowing from within the fully assembled Igloo entrance (above 0.55 progress)
        if (assemblyProgress > 0.65) {
          ctx.save();
          const fireAlpha = Math.min(1.0, (assemblyProgress - 0.65) * 5) * sectionAlpha;
          ctx.globalAlpha = fireAlpha * (0.85 + Math.sin(frame * 0.14) * 0.15); // flickering fire effect

          const fireProj = project({ x: 0, y: -20, z: -35 }, 0.2, localRotationY * 0.3, 0, { x: 0, y: 10, z: 140 });
          const fireSize = Math.max(30, 65 * (1 + Math.sin(frame * 0.1) * 0.05));

          const fireGlow = ctx.createRadialGradient(fireProj.x, fireProj.y, 4, fireProj.x, fireProj.y, fireSize);
          fireGlow.addColorStop(0, 'rgba(251, 146, 60, 0.95)'); // warm orange core
          fireGlow.addColorStop(0.4, 'rgba(249, 115, 22, 0.4)');
          fireGlow.addColorStop(0.75, 'rgba(239, 68, 68, 0.15)');
          fireGlow.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = fireGlow;
          ctx.beginPath();
          ctx.arc(fireProj.x, fireProj.y, fireSize, 0, Math.PI*2);
          ctx.fill();
          ctx.restore();
        }
      }

      // ================= SECTION 3: TECH OVERRIDE MONOLITH (Progress 0.65 to 1.0) =================
      if (progress >= 0.65) {
        // Fade in monolith
        let sectionAlpha = 1.0;
        if (progress < 0.75) {
          sectionAlpha = (progress - 0.65) / 0.1;
        }

        // Monolith descends from outer bounds
        // 0.65 to 0.88: Descends and aligns
        const monolithDescend = progress < 0.88 
          ? -350 + ((progress - 0.65) / 0.23) * 350
          : 0;

        const translation: Point3D = {
          x: 0,
          y: monolithDescend + ambientOsc,
          z: 110
        };

        const rotationY = localRotationY * 0.85;
        const rotationX = 0.25 + Math.sin(frame * 0.005) * 0.1;

        // Project monolith vertices
        const projPoints = assets.monolithVertices.map((v) =>
          project(v, rotationX, rotationY, 0, translation)
        );

        // Render wireframe grid and shaded facets
        assets.monolithFaces.forEach((face) => {
          ctx.save();
          ctx.globalAlpha = sectionAlpha;

          ctx.beginPath();
          face.indices.forEach((vIdx, step) => {
            const pt = projPoints[vIdx];
            if (step === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.closePath();

          // Dark core facets
          const grad = ctx.createLinearGradient(cx, cy - 100, cx, cy + 100);
          grad.addColorStop(0, 'rgba(15, 23, 42, 0.96)');
          grad.addColorStop(1, 'rgba(30, 41, 59, 0.94)');
          ctx.fillStyle = grad;
          ctx.fill();

          // Laser cyber outlines
          ctx.strokeStyle = '#06b6d4'; // cyan
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.restore();
        });

        // Tech overlays: glowing scanner line scanning vertically
        ctx.save();
        ctx.globalAlpha = sectionAlpha;
        const scanY = cy + Math.sin(frame * 0.04) * 110;
        const scanGrad = ctx.createLinearGradient(cx - 120, scanY, cx + 120, scanY);
        scanGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
        scanGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.65)');
        scanGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

        ctx.strokeStyle = scanGrad;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 100, scanY);
        ctx.lineTo(cx + 100, scanY);
        ctx.stroke();

        // Small tech target bracket corners around the monolith
        const bSize = 14;
        const padX = 110;
        const padY = 160;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 1.5;

        // Top Left
        ctx.beginPath();
        ctx.moveTo(cx - padX + bSize, cy - padY);
        ctx.lineTo(cx - padX, cy - padY);
        ctx.lineTo(cx - padX, cy - padY + bSize);
        ctx.stroke();

        // Top Right
        ctx.beginPath();
        ctx.moveTo(cx + padX - bSize, cy - padY);
        ctx.lineTo(cx + padX, cy - padY);
        ctx.lineTo(cx + padX, cy - padY + bSize);
        ctx.stroke();

        // Bottom Left
        ctx.beginPath();
        ctx.moveTo(cx - padX + bSize, cy + padY);
        ctx.lineTo(cx - padX, cy + padY);
        ctx.lineTo(cx - padX, cy + padY - bSize);
        ctx.stroke();

        // Bottom Right
        ctx.beginPath();
        ctx.moveTo(cx + padX - bSize, cy + padY);
        ctx.lineTo(cx + padX, cy + padY);
        ctx.lineTo(cx + padX, cy + padY - bSize);
        ctx.stroke();

        ctx.restore();
      }

      // ================= GENERAL ENVIRONMENT: WEATHER CRYOSNOW & MIST =================
      ctx.save();
      assets.weather.forEach((p) => {
        // Falling behavior
        p.y += p.vy * p.speedMultiplier;
        p.x += p.vx * p.speedMultiplier;

        // Reset if goes off limits
        if (p.y > h + 20) {
          p.y = -20;
          p.x = (Math.random() - 0.5) * w * 1.5;
        }
        if (p.x < -100) p.x = w + 100;
        if (p.x > w + 100) p.x = -100;

        // Draw snowy particle
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [darkMode]);

  // Click handler to auto-scroll smoothly to a section
  const handleSectionJump = (secIndex: number) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    
    // Calculate targeted scroll position
    let targetRatio = 0;
    if (secIndex === 0) targetRatio = 0.02;
    else if (secIndex === 1) targetRatio = 0.45;
    else if (secIndex === 2) targetRatio = 0.82;
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

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[400vh] w-full bg-[#05070f] text-slate-100 font-sans selection:bg-sky-500/20"
    >
      {/* Absolute fullscreen fixed render canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Cinematic Corner Rainbow Prismatic Lens Flares (Igloo layout signature) */}
      <div className="fixed top-0 left-0 w-80 h-80 rounded-full bg-gradient-to-tr from-sky-400/10 via-indigo-500/5 to-transparent blur-[80px] pointer-events-none z-10 select-none mix-blend-screen" />
      <div className="fixed bottom-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/5 via-sky-400/8 to-transparent blur-[100px] pointer-events-none z-10 select-none mix-blend-screen" />

      {/* Fixed Futuristic Header Block */}
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
          <button onClick={() => handleSectionJump(0)} className={`hover:text-white transition-colors cursor-pointer ${activeSection === 0 ? 'text-sky-400' : ''}`}>01 / CORE</button>
          <button onClick={() => handleSectionJump(1)} className={`hover:text-white transition-colors cursor-pointer ${activeSection === 1 ? 'text-sky-400' : ''}`}>02 / CRYO</button>
          <button onClick={() => handleSectionJump(2)} className={`hover:text-white transition-colors cursor-pointer ${activeSection === 2 ? 'text-sky-400' : ''}`}>03 / OVERRIDE</button>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-full text-[9px] font-black text-sky-400 tracking-wider flex items-center gap-1.5 shadow-md">
            <Shield size={10} className="animate-pulse" />
            <span>SECURE OVERRIDE MODE</span>
          </div>
        </div>
      </header>

      {/* Atmospheric coordinate sidebar (Igloo signature visual telemetry) */}
      <div className="fixed left-6 md:left-8 bottom-8 z-30 select-none font-mono text-[9px] text-slate-500 tracking-widest hidden md:flex flex-col gap-1.5 leading-none pointer-events-none text-left">
        <div className="flex items-center gap-1.5">
          <Compass size={11} className="text-sky-500" />
          <span>LAT: 64.1265° N / LON: 21.8174° W</span>
        </div>
        <div>SYS TEMP: -34°C (STABLE)</div>
        <div>STATION ID: CRYO-CORE.091</div>
      </div>

      {/* Vertical Step Segment Sidebar Indicators (Right) */}
      <div className="fixed right-6 md:right-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-6 select-none text-right font-mono text-[9px] pointer-events-auto">
        {[
          { num: '01', label: 'SOLIDUS REACTOR' },
          { num: '02', label: 'CRYO CHAMBER' },
          { num: '03', label: 'OVERRIDE MONOLITH' },
          { num: '04', label: 'CORE DECODED' }
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

      {/* Floating scroll indicator at the absolute center bottom */}
      <AnimatePresence>
        {scrollProgress < 0.85 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.6, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 font-mono text-[9px] text-slate-400 tracking-[0.3em] pointer-events-none uppercase"
          >
            <span>SCROLL DOWN TO DRIFT</span>
            <ChevronDown size={14} className="text-sky-400" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage-linked Cinematic Context Titles (Scrolling narrative overlays) */}
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
                STAGE 01 // CRYO CORE
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
                SOLIDUS REACTOR
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                An industrial heavy segmented core assembly engineered for thermal fusion. Scroll to disassemble and unlock the biometric cryogenic locks.
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
                STAGE 02 // THERMAL DOME
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
                IGLOO CRYO ASSEMBLY
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Glacial molecular restructuring active. Translucent blocks construct a heavy cryogenic shield as you descend into the deep sub-zero layers.
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
                STAGE 03 // DIGITAL DECONSTRUCTION
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
                OVERRIDE MONOLITH
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                A massive geometric scanning monolith descending from the high-altitude cloud vault to bypass the secure system mainframes.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FINAL BYPASS CONSOLE / LOGIN FORM (With ultra smooth unblur based on scrollProgress) */}
      <AnimatePresence>
        {scrollProgress >= 0.75 && (() => {
          const progressRatio = Math.max(0, Math.min(1, (scrollProgress - 0.75) / 0.15)); // goes 0 to 1 as scrollProgress goes 0.75 to 0.90
          const blurAmount = Math.max(0, 16 - progressRatio * 16);
          const opacityAmount = progressRatio;
          const scaleAmount = 0.95 + progressRatio * 0.05;
          const isInteractive = scrollProgress >= 0.85;

          return (
            <div 
              className={`fixed inset-0 z-30 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-[4px] transition-all duration-300 ${isInteractive ? 'pointer-events-auto' : 'pointer-events-none'}`}
              style={{
                filter: `blur(${blurAmount}px)`,
                opacity: opacityAmount,
              }}
            >
              <motion.div
                style={{
                  transform: `scale(${scaleAmount})`,
                }}
                className="w-full max-w-md bg-slate-900/90 border-2 border-slate-800/80 p-8 rounded-[32px] shadow-[0_0_80px_rgba(0,0,0,0.8)] text-center flex flex-col space-y-5 select-none"
              >
                {/* Top Bracket detail */}
                <div className="w-16 h-1.5 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 rounded-full mx-auto shadow-inner" />

                <div className="mx-auto w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 animate-pulse">
                  <Lock size={22} />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-black tracking-[0.3em] text-sky-400 uppercase font-mono block">STAGE 04 // BIOMETRIC INGRESS</span>
                  <h3 className="text-xl font-extrabold uppercase tracking-tight text-white">Authorized Personnel Only</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto font-medium">
                    Please sign in with an authorized corporate account to access the Chat Igloo Playground.
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
                      className="w-full text-xs font-medium bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 focus:bg-slate-950 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-slate-100 select-text font-sans"
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
                        className="w-full text-xs font-medium bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 focus:bg-slate-950 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-slate-100 select-text font-sans"
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
                        <span>SECURE INGRESS</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </form>

                {/* Status details line */}
                <div className="mt-1 flex items-center justify-center gap-1 text-[9px] text-slate-500 tracking-wider font-mono uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span>RESTRICTED QUANTUM LINK ACTIVE</span>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Extreme Supersonic Camera Warp Transition Overlay */}
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
              BYPASS COMPLETE
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
