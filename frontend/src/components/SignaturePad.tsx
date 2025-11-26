import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import './SignaturePad.css';

export interface SignaturePadRef {
  clear: () => void;
  getSignatureData: () => string | null;
  isEmpty: () => boolean;
}

interface SignaturePadProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  penColor?: string;
  penWidth?: number;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(({
  width = 400,
  height = 200,
  backgroundColor = '#ffffff',
  penColor = '#000000',
  penWidth = 2
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);
      }
    }
  }, [width, height, backgroundColor, penColor, penWidth]);

  const clear = () => {
    if (context) {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);
    }
  };

  const getSignatureData = (): string | null => {
    const canvas = canvasRef.current;
    if (canvas) {
      return canvas.toDataURL('image/png');
    }
    return null;
  };

  const isEmpty = (): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return true;

    const imageData = canvas.getContext('2d')?.getImageData(0, 0, width, height);
    if (!imageData) return true;

    // Check if all pixels are the same as background
    const pixelBuffer = new Uint32Array(imageData.data.buffer);
    const backgroundColor32 = 0xFFFFFFFF; // White background
    
    for (let i = 0; i < pixelBuffer.length; i++) {
      if (pixelBuffer[i] !== backgroundColor32) {
        return false;
      }
    }
    return true;
  };

  useImperativeHandle(ref, () => ({
    clear,
    getSignatureData,
    isEmpty
  }));

  const getEventPos = (event: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!context) return;

    const pos = getEventPos(event);
    setIsDrawing(true);
    context.beginPath();
    context.moveTo(pos.x, pos.y);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing || !context) return;

    const pos = getEventPos(event);
    context.lineTo(pos.x, pos.y);
    context.stroke();
  };

  const stopDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing) return;
    
    setIsDrawing(false);
    if (context) {
      context.closePath();
    }
  };

  return (
    <div className="signature-pad-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="signature-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
      />
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;