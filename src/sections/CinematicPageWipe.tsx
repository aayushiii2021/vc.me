import { useEffect, useRef } from 'react';

interface CinematicPageWipeProps {
  progress: number; // 0 to 1
  centerX?: number;
  centerY?: number;
}

export default function CinematicPageWipe({ progress, centerX = 50, centerY = 50 }: CinematicPageWipeProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;
    const radius = progress * 150; // 0% to 150%
    overlayRef.current.style.setProperty('--cx', `${centerX}%`);
    overlayRef.current.style.setProperty('--cy', `${centerY}%`);
    overlayRef.current.style.setProperty('--cr', `${radius}%`);
  }, [progress, centerX, centerY]);

  if (progress >= 1) return null;

  return (
    <div
      ref={overlayRef}
      className="transition-overlay"
      style={{
        '--cx': `${centerX}%`,
        '--cy': `${centerY}%`,
        '--cr': `${progress * 150}%`,
      } as React.CSSProperties}
    />
  );
}