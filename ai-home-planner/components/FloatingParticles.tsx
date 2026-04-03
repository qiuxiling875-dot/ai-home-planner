"use client";

// ============================================================
// 浮动装饰粒子 - 背景氛围组件
// 柔和的渐变圆点，缓慢浮动，营造温馨装修感
// ============================================================

const PARTICLES = [
  { size: 60,  color: "#D4A574", left: "8%",  top: "10%", anim: "float-particle-0", dur: "10s" },
  { size: 100, color: "#8B9D83", left: "25%", top: "5%",  anim: "float-particle-1", dur: "12s" },
  { size: 80,  color: "#D4C5B2", left: "45%", top: "15%", anim: "float-particle-2", dur: "9s" },
  { size: 120, color: "#C9A96E", left: "65%", top: "8%",  anim: "float-particle-0", dur: "14s" },
  { size: 70,  color: "#8B9D83", left: "80%", top: "20%", anim: "float-particle-1", dur: "11s" },
  { size: 90,  color: "#D4A574", left: "92%", top: "12%", anim: "float-particle-2", dur: "13s" },
];

export default function FloatingParticles() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `radial-gradient(circle, ${p.color} 0%, transparent 70%)`,
            left: p.left,
            top: p.top,
            opacity: 0.15,
            animation: `${p.anim} ${p.dur} ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}
    </div>
  );
}
