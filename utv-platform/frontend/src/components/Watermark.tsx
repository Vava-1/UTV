import React from 'react';
import { UTVLogo } from './UTVLogo';

interface WatermarkProps {
  children: React.ReactNode;
  className?: string;
  showLogo?: boolean;
}

export function Watermark({ children, className = "", showLogo = true }: WatermarkProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {showLogo && (
        <div className="absolute top-4 left-4 opacity-70 pointer-events-none">
          <UTVLogo size="small" className="text-amber-500" />
        </div>
      )}
    </div>
  );
}

// Hook for adding watermark to downloadable content
export function useWatermark() {
  const addWatermarkToCanvas = (canvas: HTMLCanvasElement, options?: {
    opacity?: number;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    size?: number;
  }) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const {
      opacity = 0.7,
      position = 'top-left',
      size = 40
    } = options || {};

    // Save current context state
    ctx.save();

    // Set watermark properties
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#f59e0b'; // amber-500

    // Calculate position
    let x = 20, y = 20;
    switch (position) {
      case 'top-right':
        x = canvas.width - size - 20;
        break;
      case 'bottom-left':
        y = canvas.height - size - 20;
        break;
      case 'bottom-right':
        x = canvas.width - size - 20;
        y = canvas.height - size - 20;
        break;
      case 'center':
        x = (canvas.width - size) / 2;
        y = (canvas.height - size) / 2;
        break;
    }

    // Draw music note logo (simplified version)
    ctx.beginPath();
    // Note stem
    ctx.moveTo(x + size * 0.7, y + size * 0.2);
    ctx.lineTo(x + size * 0.7, y + size * 0.8);
    ctx.lineWidth = size * 0.08;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Note head
    ctx.beginPath();
    ctx.ellipse(x + size * 0.5, y + size * 0.8, size * 0.2, size * 0.15, -Math.PI / 6, 0, 2 * Math.PI);
    ctx.fill();

    // Second note
    ctx.beginPath();
    ctx.moveTo(x + size * 0.85, y + size * 0.1);
    ctx.lineTo(x + size * 0.85, y + size * 0.6);
    ctx.lineWidth = size * 0.08;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(x + size * 0.65, y + size * 0.6, size * 0.2, size * 0.15, -Math.PI / 6, 0, 2 * Math.PI);
    ctx.fill();

    // Beam
    ctx.beginPath();
    ctx.moveTo(x + size * 0.7, y + size * 0.2);
    ctx.lineTo(x + size * 0.85, y + size * 0.1);
    ctx.lineWidth = size * 0.08;
    ctx.stroke();

    // Restore context state
    ctx.restore();

    return canvas;
  };

  const downloadWithWatermark = (
    imageUrl: string,
    filename: string,
    options?: {
      opacity?: number;
      position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
      size?: number;
    }
  ) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Add watermark
      addWatermarkToCanvas(canvas, options);

      // Download the watermarked image
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    };

    img.src = imageUrl;
  };

  return {
    addWatermarkToCanvas,
    downloadWithWatermark
  };
}
