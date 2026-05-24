export default function BeforeAfterGraphic() {
  return (
    <div
      style={{
        background: '#0F172A',
        borderRadius: 12,
        padding: 28,
        color: '#E2E8F0',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* BEFORE */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              color: '#F87171',
              marginBottom: 10,
            }}
          >
            BEFORE
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 18,
              fontWeight: 500,
              color: '#F1F5F9',
              marginBottom: 16,
            }}
          >
            Glue code everywhere
          </div>
          <svg viewBox="0 0 240 180" style={{ width: '100%', height: 'auto' }} aria-hidden>
            <defs>
              <marker id="arrR" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" fill="#F87171" />
              </marker>
            </defs>
            {[
              { x: 12, y: 14, t: 'LLM' },
              { x: 130, y: 14, t: 'Tools' },
              { x: 12, y: 70, t: 'Data' },
              { x: 130, y: 70, t: 'Evals' },
              { x: 12, y: 128, t: 'Deploy' },
              { x: 130, y: 128, t: 'Logs' },
            ].map((b) => (
              <g key={b.t}>
                <rect
                  x={b.x}
                  y={b.y}
                  width={92}
                  height={36}
                  rx={6}
                  fill="#1E293B"
                  stroke="#334155"
                />
                <text
                  x={b.x + 46}
                  y={b.y + 22}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#E2E8F0"
                  fontFamily="Inter, sans-serif"
                  fontWeight={600}
                >
                  {b.t}
                </text>
              </g>
            ))}
            {[
              'M58 50 L176 32',
              'M176 50 L58 88',
              'M58 106 L176 88',
              'M176 106 L58 146',
              'M58 50 L176 146',
              'M176 32 L58 146',
              'M104 32 L130 88',
            ].map((d, i) => (
              <path
                key={i}
                d={d}
                stroke="#F87171"
                strokeWidth={1.2}
                strokeOpacity={0.65}
                fill="none"
                markerEnd="url(#arrR)"
              />
            ))}
          </svg>
        </div>

        {/* AFTER */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              color: '#FF6600',
              marginBottom: 10,
            }}
          >
            WITH ROCKETRIDE
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 18,
              fontWeight: 500,
              color: '#F1F5F9',
              marginBottom: 16,
            }}
          >
            One pipeline. Ship to prod.
          </div>
          <svg viewBox="0 0 240 180" style={{ width: '100%', height: 'auto' }} aria-hidden>
            <defs>
              <marker id="arrO" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" fill="#FF6600" />
              </marker>
              <linearGradient id="rocketStroke" x1="0" x2="1">
                <stop offset="0" stopColor="#FF6600" />
                <stop offset="1" stopColor="#FFB36B" />
              </linearGradient>
            </defs>
            {[
              { y: 14, t: 'Idea' },
              { y: 56, t: 'RocketRide pipeline' },
              { y: 98, t: 'Evals + Deploy' },
              { y: 140, t: 'Production' },
            ].map((b, i) => (
              <g key={b.t}>
                <rect
                  x={24}
                  y={b.y}
                  width={192}
                  height={30}
                  rx={6}
                  fill={i === 1 ? '#FF6600' : '#1E293B'}
                  stroke={i === 1 ? '#FF6600' : '#334155'}
                />
                <text
                  x={120}
                  y={b.y + 19}
                  textAnchor="middle"
                  fontSize={12}
                  fill={i === 1 ? '#0F172A' : '#E2E8F0'}
                  fontFamily="Inter, sans-serif"
                  fontWeight={700}
                >
                  {b.t}
                </text>
              </g>
            ))}
            <path
              d="M120 44 L120 56"
              stroke="url(#rocketStroke)"
              strokeWidth={2}
              markerEnd="url(#arrO)"
            />
            <path
              d="M120 86 L120 98"
              stroke="url(#rocketStroke)"
              strokeWidth={2}
              markerEnd="url(#arrO)"
            />
            <path
              d="M120 128 L120 140"
              stroke="url(#rocketStroke)"
              strokeWidth={2}
              markerEnd="url(#arrO)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
