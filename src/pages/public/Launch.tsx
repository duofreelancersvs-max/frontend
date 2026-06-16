import { SEO } from '@/components/SEO/SEO';
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/shared/Logo";

// ─── Animated Particles Background ─────────────────────────────────
const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }[] = [];

    const colors = [
      "rgba(20, 184, 166, 0.4)",
      "rgba(59, 130, 246, 0.3)",
      "rgba(99, 102, 241, 0.2)",
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      particles = [];
      const count = Math.min(
        Math.floor((canvas.width * canvas.height) / 12000),
        80,
      );
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(20, 184, 166, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      drawLines();
      animationId = requestAnimationFrame(animate);
    };

    resize();
    initParticles();
    animate();

    const handleResize = () => {
      resize();
      initParticles();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.7 }}
      />
      <SEO title="Launching Soon | ConnectMeIndia" description="ConnectMeIndia is launching soon. Get ready to connect with top freelancers and clients." canonical="/launch" />
    </>
  );
};

// ─── Confetti Burst ─────────────────────────────────────────────────
const ConfettiBurst = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }[] = [];

    const colors = [
      "#14B8A6", // teal
      "#3B82F6", // blue
      "#F59E0B", // gold
      "#EC4899", // pink
      "#8B5CF6", // purple
      "#10B981", // emerald
      "#FFFFFF", // white
    ];

    // Create confetti particles bursting from center
    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      confetti.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
      });
    }

    let frame = 0;
    const maxFrames = 180;

    const animate = () => {
      if (frame >= maxFrames) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const c of confetti) {
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.15; // gravity
        c.vx *= 0.99; // air resistance
        c.rotation += c.rotationSpeed;
        c.opacity = Math.max(0, 1 - frame / maxFrames);

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rotation * Math.PI) / 180);
        ctx.globalAlpha = c.opacity;
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
        ctx.restore();
      }

      frame++;
      requestAnimationFrame(animate);
    };

    animate();
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[200] pointer-events-none"
    />
  );
};

// ─── Curtain Overlay ────────────────────────────────────────────────
const CurtainOverlay = ({
  isOpening,
  onAnimationEnd,
}: {
  isOpening: boolean;
  onAnimationEnd: () => void;
}) => {
  useEffect(() => {
    if (isOpening) {
      const timer = setTimeout(onAnimationEnd, 3500); // 3 seconds duration
      return () => clearTimeout(timer);
    }
  }, [isOpening, onAnimationEnd]);

  // Framer motion variants for realistic curtain bunching - 3 sec duration
  const leftCurtainVariants = {
    closed: { scaleX: 1, x: 0, skewX: 0 },
    open: {
      scaleX: 0.15,
      x: "-15%", // pull left
      skewX: -5, // slight tilt as it bunches
      transition: {
        duration: 3.0,
        ease: [0.64, 0, 0.13, 1] as [number, number, number, number],
      },
    },
  };

  const rightCurtainVariants = {
    closed: { scaleX: 1, x: 0, skewX: 0 },
    open: {
      scaleX: 0.15,
      x: "15%", // pull right
      skewX: 5, // slight tilt as it bunches
      transition: {
        duration: 3.0,
        ease: [0.64, 0, 0.13, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <div
      className="fixed inset-0 z-[150] pointer-events-none overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      {/* Left Curtain */}
      <motion.div
        initial="closed"
        animate={isOpening ? "open" : "closed"}
        variants={leftCurtainVariants}
        style={{ transformOrigin: "left top" }}
        className="absolute top-0 left-0 w-1/2 h-full shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
      >
        {/* Deep Red Velvet Fabric */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-red-800 to-red-900" />

        {/* 3D Fold lines (using repeating linear gradients for fabric waves) */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.4) 100%)",
            backgroundSize: "20% 100%",
          }}
        />

        {/* Heavy bottom hem */}
        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Gold trim on the edge */}
        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700 shadow-[-2px_0_10px_rgba(245,158,11,0.3)]" />

        {/* Tassel */}
        <div className="absolute top-1/2 right-6 -translate-y-1/2 drop-shadow-2xl z-10">
          <div className="w-1.5 h-24 bg-gradient-to-b from-amber-400/80 to-amber-600 rounded-full" />
          <div className="w-6 h-8 bg-gradient-to-b from-amber-300 to-amber-600 rounded-full -ml-2 mt-1 shadow-lg" />
          {/* Tassel strings */}
          <div className="w-8 h-12 flex justify-between mt-1 -ml-3">
            <div className="w-0.5 h-full bg-amber-500 rounded-full" />
            <div className="w-0.5 h-[90%] bg-amber-400 rounded-full mt-1" />
            <div className="w-0.5 h-full bg-amber-600 rounded-full" />
            <div className="w-0.5 h-[80%] bg-amber-500 rounded-full mt-2" />
          </div>
        </div>
      </motion.div>

      {/* Right Curtain */}
      <motion.div
        initial="closed"
        animate={isOpening ? "open" : "closed"}
        variants={rightCurtainVariants}
        style={{ transformOrigin: "right top" }}
        className="absolute top-0 right-0 w-1/2 h-full shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
      >
        {/* Deep Red Velvet Fabric */}
        <div className="absolute inset-0 bg-gradient-to-l from-red-950 via-red-800 to-red-900" />

        {/* 3D Fold lines */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(to left, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.4) 100%)",
            backgroundSize: "20% 100%",
          }}
        />

        {/* Heavy bottom hem */}
        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Gold trim on the edge */}
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-l from-amber-600 via-amber-400 to-amber-700 shadow-[2px_0_10px_rgba(245,158,11,0.3)]" />

        {/* Tassel */}
        <div className="absolute top-1/2 left-6 -translate-y-1/2 drop-shadow-2xl z-10">
          <div className="w-1.5 h-24 bg-gradient-to-b from-amber-400/80 to-amber-600 rounded-full" />
          <div className="w-6 h-8 bg-gradient-to-b from-amber-300 to-amber-600 rounded-full -ml-2 mt-1 shadow-lg" />
          {/* Tassel strings */}
          <div className="w-8 h-12 flex justify-between mt-1 -ml-2">
            <div className="w-0.5 h-[80%] bg-amber-500 rounded-full mt-2" />
            <div className="w-0.5 h-full bg-amber-600 rounded-full" />
            <div className="w-0.5 h-[90%] bg-amber-400 rounded-full mt-1" />
            <div className="w-0.5 h-full bg-amber-500 rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* Top valance / pelmet (stays static and creates depth) */}
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={isOpening ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-red-950 via-red-900 to-transparent z-10"
      >
        {/* Scalloped edge effect */}
        <div className="absolute bottom-0 left-0 w-full h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTIwIDIwQzkgMjAgMCAwIDAgMGg0MGMwIDAgLTkgMjAgLTIwIDIweiIgZmlsbD0iIzRBMDQwNCIgLz48L3N2Zz4=')] opacity-50" />
      </motion.div>

      {/* Center cinematic light beam (appears during opening) */}
      {isOpening && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: [0, 1, 0], scaleX: [0, 5, 20] }}
          transition={{ duration: 3.0, times: [0, 0.4, 1], ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        >
          <div className="w-4 h-full bg-gradient-to-r from-transparent via-red-300 to-transparent blur-[30px]" />
        </motion.div>
      )}
    </div>
  );
};


// ─── Main Launch Page ───────────────────────────────────────────────
const LaunchPage = () => {
  const navigate = useNavigate();
  const [heroMounted, setHeroMounted] = useState(false);

  // Curtain animation state
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLaunchMessage, setShowLaunchMessage] = useState(false);
  
  // Countdown State
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setHeroMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Countdown finished
      setShowLaunchMessage(true);
      setTimeout(() => {
        setShowConfetti(true);
        setCurtainsOpen(true);
      }, 200);
      setCountdown(-1);
    }
  }, [countdown]);

  const handleLaunch = () => {
    // Start countdown
    setCountdown(3);
  };

  const handleCurtainAnimationEnd = useCallback(() => {
    // Navigate to home after curtains are fully open
    setTimeout(() => {
      navigate("/");
    }, 1000);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#050B15] text-white font-sans overflow-x-hidden relative selection:bg-teal/30 flex items-center justify-center">
      <ParticleField />

      {/* Curtain Overlay — only mounts after countdown starts */}
      {countdown !== null && (
        <CurtainOverlay
          isOpening={curtainsOpen}
          onAnimationEnd={handleCurtainAnimationEnd}
        />
      )}

      {/* Confetti Burst */}
      <ConfettiBurst active={showConfetti} />

      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdown !== null && countdown > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[160] flex items-center justify-center pointer-events-none"
          >
            <h1 className="text-9xl md:text-[200px] font-black text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]">
              {countdown}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launch Announcement Overlay */}
      {showLaunchMessage && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center pointer-events-none">
          <div
            className={`relative flex flex-col items-center justify-center transition-all duration-[1500ms] ${
              showLaunchMessage
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-75 translate-y-12"
            }`}
          >
            {/* Cinematic Glow Behind Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-teal/30 blur-[100px] rounded-full mix-blend-screen animate-pulse pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[300px] md:h-[300px] bg-emerald-500/20 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-center"
            >
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 tracking-tight drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">
                  We Are Live
                </span>
              </h2>
              <div className="flex items-center justify-center gap-2 mb-10 md:mb-16">
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-teal/50" />
                <span className="text-teal font-medium tracking-[0.3em] uppercase text-sm md:text-base animate-pulse">
                  Welcome to the Future
                </span>
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-teal/50" />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              {/* Floating Logo without the restrictive box */}
              <div className="scale-125 md:scale-150 transform transition-transform">
                <Logo size="lg" isDark={true} withText={true} />
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal/[0.07] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-royal-blue/[0.05] rounded-full blur-[100px]" />
      </div>

      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <section className="relative z-10 w-full flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="text-center w-full flex items-center justify-center">
          
          {/* ONLY Launch Button is visible initially */}
          {countdown === null && (
            <div
              className={`transition-all duration-1000 ${
                heroMounted
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-12 scale-90"
              }`}
            >
              <button
                onClick={handleLaunch}
                className="group relative flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-teal via-emerald-500 to-teal text-2xl sm:text-3xl font-black text-white overflow-hidden shadow-[0_0_50px_rgba(20,184,166,0.5)] hover:shadow-[0_0_80px_rgba(20,184,166,0.8)] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                {/* Animated shimmer */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_2s_ease-in-out_infinite]" />
                
                <span className="relative z-10 tracking-widest uppercase">
                  Launch
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ─── Inline keyframes ────────────────────────────────────── */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(200%) rotate(45deg); }
        }
      `}</style>
    </div>
  );
};

export default LaunchPage;

