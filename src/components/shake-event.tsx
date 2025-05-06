"use client";
import { useEffect } from 'react';

interface ShakeEventProps {
  onShake: () => void;
  threshold?: number;
  shakeInterval?: number;
}

export const ShakeEvent: React.FC<ShakeEventProps> = ({ onShake, threshold = 15, shakeInterval = 250 }) => {
  useEffect(() => {
    let lastShake = 0;

    const shake = (event: DeviceMotionEvent) => {
      const now = Date.now();

      if (now - lastShake > shakeInterval) {
        const acceleration = event.accelerationIncludingGravity;

        if (!acceleration) {
          return;
        }

        const { x, y, z } = acceleration;

        if (Math.abs(x || 0) > threshold || Math.abs(y || 0) > threshold || Math.abs(z || 0) > threshold) {
          lastShake = now;
          onShake();
        }
      }
    };

    window.addEventListener('devicemotion', shake);

    return () => window.removeEventListener('devicemotion', shake);
  }, [onShake, threshold, shakeInterval]);

  return null;
};
