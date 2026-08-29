const RAY_COUNT = 20;

export default function Sunburst({
  lines,
  reference,
}: {
  lines: string[];
  reference: string;
}) {
  const rays = Array.from({ length: RAY_COUNT }, (_, i) => {
    const angle = (i / RAY_COUNT) * 360;
    const long = i % 2 === 0;
    return { angle, long };
  });

  return (
    <div className="relative mx-auto flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        {rays.map(({ angle, long }, i) => {
          const inner = 62;
          const outer = long ? 98 : 84;
          const rad = (angle * Math.PI) / 180;
          const x1 = 100 + inner * Math.sin(rad);
          const y1 = 100 - inner * Math.cos(rad);
          const x2 = 100 + outer * Math.sin(rad);
          const y2 = 100 - outer * Math.cos(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#dab838"
              strokeWidth={4}
              strokeLinecap="round"
            />
          );
        })}
        <path
          d="M 42 100 A 58 58 0 0 1 158 100"
          fill="none"
          stroke="#dab838"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </svg>
      <div className="relative flex flex-col items-center text-center leading-none text-gold-500">
        {lines.map((line) => (
          <span key={line} className="font-display text-xl uppercase tracking-wide sm:text-2xl">
            {line}
          </span>
        ))}
        <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-gold-600">
          {reference}
        </span>
      </div>
    </div>
  );
}
