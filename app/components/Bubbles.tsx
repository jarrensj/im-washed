const bubbles = [
  { left: '4%', size: 18, duration: 17, delay: -2 },
  { left: '11%', size: 32, duration: 22, delay: -9 },
  { left: '19%', size: 12, duration: 14, delay: -5 },
  { left: '27%', size: 24, duration: 19, delay: -14 },
  { left: '34%', size: 40, duration: 24, delay: -7 },
  { left: '42%', size: 16, duration: 15, delay: -11 },
  { left: '49%', size: 28, duration: 20, delay: -3 },
  { left: '57%', size: 14, duration: 13, delay: -16 },
  { left: '64%', size: 36, duration: 23, delay: -6 },
  { left: '72%', size: 20, duration: 18, delay: -12 },
  { left: '79%', size: 26, duration: 21, delay: -4 },
  { left: '86%', size: 14, duration: 16, delay: -10 },
  { left: '92%', size: 30, duration: 22, delay: -15 },
];

export default function Bubbles() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
    >
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="bubble absolute rounded-full bg-gradient-to-br from-indigo-300/30 to-purple-300/30 ring-1 ring-white/40"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
