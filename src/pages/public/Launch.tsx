import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Zap, Shield, Users, Globe, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
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
      const timer = setTimeout(onAnimationEnd, 1400); // give enough time for the smooth animation
      return () => clearTimeout(timer);
    }
  }, [isOpening, onAnimationEnd]);

  // Framer motion variants for realistic curtain bunching
  const leftCurtainVariants = {
    closed: { scaleX: 1, x: 0, skewX: 0 },
    open: { 
      scaleX: 0.15, 
      x: "-15%", // pull left
      skewX: -5, // slight tilt as it bunches
      transition: { duration: 1.2, ease: [0.64, 0, 0.13, 1] as [number, number, number, number] } 
    }
  };

  const rightCurtainVariants = {
    closed: { scaleX: 1, x: 0, skewX: 0 },
    open: { 
      scaleX: 0.15, 
      x: "15%", // pull right
      skewX: 5, // slight tilt as it bunches
      transition: { duration: 1.2, ease: [0.64, 0, 0.13, 1] as [number, number, number, number] } 
    }
  };

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none overflow-hidden" style={{ perspective: "1000px" }}>
      {/* Left Curtain */}
      <motion.div
        initial="closed"
        animate={isOpening ? "open" : "closed"}
        variants={leftCurtainVariants}
        style={{ transformOrigin: "left top" }}
        className="absolute top-0 left-0 w-1/2 h-full shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
      >
        {/* Deep Velvet Fabric */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C1929] via-[#122742] to-[#0A1628]" />

        {/* 3D Fold lines (using repeating linear gradients for fabric waves) */}
        <div 
          className="absolute inset-0 opacity-80" 
          style={{
            backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.4) 100%)",
            backgroundSize: "20% 100%"
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
        {/* Deep Velvet Fabric */}
        <div className="absolute inset-0 bg-gradient-to-l from-[#0C1929] via-[#122742] to-[#0A1628]" />

        {/* 3D Fold lines */}
        <div 
          className="absolute inset-0 opacity-80" 
          style={{
            backgroundImage: "linear-gradient(to left, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.4) 100%)",
            backgroundSize: "20% 100%"
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
        className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#050B15] via-[#0A1628] to-transparent z-10"
      >
        {/* Scalloped edge effect */}
        <div className="absolute bottom-0 left-0 w-full h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTIwIDIwQzkgMjAgMCAwIDAgMGg0MGMwIDAgLTkgMjAgLTIwIDIweiIgZmlsbD0iIzBBMTYyOCIgLz48L3N2Zz4=')] opacity-50" />
      </motion.div>

      {/* Center cinematic light beam (appears during opening) */}
      {isOpening && (
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: [0, 1, 0], scaleX: [0, 5, 20] }}
          transition={{ duration: 2, times: [0, 0.4, 1], ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        >
          <div className="w-4 h-full bg-gradient-to-r from-transparent via-teal-300 to-transparent blur-[30px]" />
        </motion.div>
      )}
    </div>
  );
};

// ─── Countdown Timer ────────────────────────────────────────────────
// ⚠️ CHANGE THIS to your actual production launch date before going live!
// When Date.now() >= LAUNCH_DATE, the countdown is replaced by the Launch button.
const LAUNCH_DATE = new Date("2026-06-13T00:00:00+05:30");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const getTimeLeft = (): TimeLeft => {
  const diff = Math.max(0, LAUNCH_DATE.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const CountdownUnit = ({
  value,
  label,
  delay,
}: {
  value: number;
  label: string;
  delay: number;
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`flex flex-col items-center transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-teal/20 to-royal-blue/20 rounded-2xl blur-md group-hover:blur-lg transition-all duration-500 opacity-60" />
        <div className="relative w-20 h-24 sm:w-28 sm:h-32 bg-[#0A1628]/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
          <span className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tabular-nums">
            {String(value).padStart(2, "0")}
          </span>
        </div>
      </div>
      <span className="mt-3 text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
  );
};

// ─── Feature Cards ──────────────────────────────────────────────────
const features = [
  {
    icon: Users,
    title: "Hire Top Talent",
    desc: "Access India's finest freelance professionals across Video Editing, VFX, Web Dev, CA & more.",
    gradient: "from-teal to-emerald-500",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    desc: "Built-in escrow and milestone-based payments. Your money stays safe until work is delivered.",
    gradient: "from-royal-blue to-indigo-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Post a project and receive qualified applications within minutes, not days.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Globe,
    title: "Pan-India Reach",
    desc: "Connect with verified freelancers from every corner of India. No borders, just talent.",
    gradient: "from-purple-500 to-pink-500",
  },
];

const FeatureCard = ({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group relative transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-teal/0 via-teal/10 to-royal-blue/0 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />
      <div className="relative bg-[#0A1628]/60 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-7 sm:p-8 h-full hover:border-teal/20 transition-all duration-500 hover:-translate-y-1">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500`}
        >
          <feature.icon size={26} />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-teal transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {feature.desc}
        </p>
      </div>
    </div>
  );
};

// ─── Main Launch Page ───────────────────────────────────────────────
const LaunchPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());
  const [heroMounted, setHeroMounted] = useState(false);
  const isLaunched = LAUNCH_DATE.getTime() <= Date.now();

  // Curtain animation state
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLaunchMessage, setShowLaunchMessage] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunch = () => {
    // Show the launch message with the person's name
    setShowLaunchMessage(true);

    // After a brief pause, fire confetti and open curtains
    setTimeout(() => {
      setShowConfetti(true);
      setCurtainsOpen(true);
    }, 400);
  };

  const handleCurtainAnimationEnd = useCallback(() => {
    // Navigate to home after curtains are fully open
    setTimeout(() => {
      navigate("/");
    }, 400);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#050B15] text-white font-sans overflow-x-hidden relative selection:bg-teal/30">
      <ParticleField />

      {/* Curtain Overlay — only mounts after launch button is clicked */}
      {showLaunchMessage && (
        <CurtainOverlay
          isOpening={curtainsOpen}
          onAnimationEnd={handleCurtainAnimationEnd}
        />
      )}

      {/* Confetti Burst */}
      <ConfettiBurst active={showConfetti} />

      {/* Launch Announcement Overlay */}
      {showLaunchMessage && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center pointer-events-none">
          <div
            className={`text-center transition-all duration-700 ${
              showLaunchMessage && !curtainsOpen
                ? "opacity-100 scale-100"
                : "opacity-0 scale-110"
            }`}
          >
            <p className="text-teal text-sm sm:text-base font-bold tracking-[0.3em] uppercase mb-3 animate-pulse">
              Launching Now
            </p>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white">
              Connect
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue">
                MeIndia
              </span>
            </h2>
          </div>
        </div>
      )}

      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal/[0.07] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-royal-blue/[0.05] rounded-full blur-[100px]" />
      </div>

      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.08] mb-8 transition-all duration-700 ${
              heroMounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4"
            }`}
          >
            <Sparkles size={14} className="text-teal" />
            <span className="text-xs sm:text-sm font-semibold text-teal tracking-wider uppercase">
              {isLaunched ? "We Are Live!" : "Coming Soon"}
            </span>
          </div>

          {/* Brand Name */}
          <h1
            className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.9] mb-6 transition-all duration-1000 ${
              heroMounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/80">
              Connect
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal via-teal to-royal-blue">
              MeIndia
            </span>
          </h1>

          {/* Tagline */}
          <p
            className={`text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium transition-all duration-700 delay-300 ${
              heroMounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            India's premier freelance marketplace is almost here.
            <br className="hidden sm:block" />
            <span className="text-white/70">
              Your Work. Your Money. Always.
            </span>
          </p>

          {/* Countdown OR Launch Button */}
          {isLaunched ? (
            <div
              className={`transition-all duration-700 delay-500 ${
                heroMounted
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-6 scale-95"
              }`}
            >
              <button
                onClick={handleLaunch}
                disabled={curtainsOpen}
                className="group relative inline-flex items-center gap-3 px-10 py-5 sm:px-14 sm:py-6 text-lg sm:text-xl font-bold text-white rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal via-emerald-500 to-teal bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />
                {/* Glow */}
                <div className="absolute inset-0 rounded-2xl shadow-[0_0_40px_rgba(20,184,166,0.4)] group-hover:shadow-[0_0_60px_rgba(20,184,166,0.6)] transition-all duration-500" />

                <span className="relative z-10">
                  {curtainsOpen ? "Launching…" : "🚀 Launch ConnectMeIndia"}
                </span>
                {!curtainsOpen && (
                  <ArrowRight
                    size={22}
                    className="relative z-10 group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>

              <p className="mt-6 text-xs text-slate-500">
                Press the button to unveil the platform
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 sm:gap-5 mb-12">
              <CountdownUnit value={timeLeft.days} label="Days" delay={400} />
              <span className="text-2xl sm:text-4xl font-light text-white/20 mt-[-1.5rem]">
                :
              </span>
              <CountdownUnit value={timeLeft.hours} label="Hours" delay={500} />
              <span className="text-2xl sm:text-4xl font-light text-white/20 mt-[-1.5rem]">
                :
              </span>
              <CountdownUnit value={timeLeft.minutes} label="Min" delay={600} />
              <span className="text-2xl sm:text-4xl font-light text-white/20 mt-[-1.5rem]">
                :
              </span>
              <CountdownUnit value={timeLeft.seconds} label="Sec" delay={700} />
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-1000 ${
            heroMounted ? "opacity-60" : "opacity-0"
          }`}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-teal rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ─── Features Section ─────────────────────────────────────── */}
      <section className="relative z-10 py-24 sm:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <span className="inline-block px-4 py-2 bg-teal/10 text-teal rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase mb-6 border border-teal/20">
              What's Coming
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-5">
              Built for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue">
                Indian Freelancers
              </span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
              Everything you need to find work, hire talent, and grow your
              freelance career — all in one platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            {features.map((feature, idx) => (
              <FeatureCard key={feature.title} feature={feature} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="relative z-10 py-12 border-t border-white/[0.05]">
        <div className="text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} ConnectMeIndia. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ─── Inline keyframes ────────────────────────────────────── */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
      `}</style>
    </div>
  );
};

export default LaunchPage;
