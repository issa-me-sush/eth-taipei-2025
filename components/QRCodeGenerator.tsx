import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  merchantId: string;
  amount?: string;
  size?: number;
}

export default function QRCodeGenerator({ merchantId, amount = '', size = 256 }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Format: taipay:{merchantId}:{amount}
      const qrData = `taipay:${merchantId}:${amount}`;
      
      QRCode.toCanvas(canvasRef.current, qrData, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });
    }
  }, [merchantId, amount, size]);

  return (
    <div className="relative aspect-square w-full bg-white rounded-lg flex items-center justify-center p-4">
      <canvas ref={canvasRef} className="max-w-full" />
      {amount && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-white text-sm rounded-full">
          {amount} ETH
        </div>
      )}
    </div>
  );
} 