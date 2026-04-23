import { useEffect, useRef, useMemo } from 'react';

const SHAPES = ['✦', '◆', '●', '○', '△', '◇', '⬡', '✧', '+', '×'];

function FloatingShapes() {
  const items = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => {
      const colors = ['#ff007a', '#0084ff', '#8a2bff', '#00e5ff', '#ffffff'];
      return {
        id: i,
        shape: SHAPES[i % SHAPES.length],
        left: `${Math.random() * 95}%`,
        size: 8 + Math.random() * 18,
        duration: 22 + Math.random() * 30,
        delay: Math.random() * -35,
        drift: (Math.random() - 0.5) * 80,
        opacity: 0.04 + Math.random() * 0.09,
        color: colors[i % colors.length],
      };
    }), []);

  return (
    <div className="floating-icons">
      {items.map(it => (
        <span
          key={it.id}
          className="floating-icon"
          style={{
            left: it.left,
            fontSize: it.size,
            opacity: it.opacity,
            color: it.color,
            animationDuration: `${it.duration}s`,
            animationDelay: `${it.delay}s`,
            '--drift': `${it.drift}px`,
          }}
        >
          {it.shape}
        </span>
      ))}
    </div>
  );
}

function DotField() {
  const items = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 3,
      color: ['#ff007a', '#0084ff', '#8a2bff', '#00e5ff'][i % 4],
      duration: 3 + Math.random() * 4,
      delay: Math.random() * -5,
    })), []);

  return (
    <div className="dot-field">
      {items.map(d => (
        <span
          key={d.id}
          className="bg-dot"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            backgroundColor: d.color,
            boxShadow: `0 0 ${d.size * 4}px ${d.color}`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function BackgroundFX() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let mouse = { x: -1000, y: -1000 };

    const COLORS = ['#ff007a', '#0084ff', '#8a2bff', '#00e5ff'];
    const COUNT = 40;
    const CONNECT_DIST = 120;
    const MOUSE_RADIUS = 160;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    function handleMouse(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    window.addEventListener('mousemove', handleMouse);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.vx -= (dx / dist) * force * 0.25;
          p.vy -= (dy / dist) * force * 0.25;
        }
        p.vx *= 0.995;
        p.vy *= 0.995;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const ddx = p.x - q.x;
          const ddy = p.y - q.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < CONNECT_DIST) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(255,255,255,${0.06 * (1 - d / CONNECT_DIST)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <div className="bg-layer" aria-hidden="true">
      <div className="bg-aurora" />
      <div className="bg-aurora-2" />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      <DotField />
      <FloatingShapes />
      <div className="cyber-grid" />
      <div className="orb pink" />
      <div className="orb blue" />
      <div className="orb violet" />
    </div>
  );
}
