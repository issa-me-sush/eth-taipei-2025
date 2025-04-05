import { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

export default function QRCodeScanner({ onScan, onError }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function startScanning() {
      try {
        if (!videoRef.current) return;

        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const devices = await reader.listVideoInputDevices();
        if (!devices.length) {
          throw new Error('No camera found');
        }

        await reader.decodeFromConstraints(
          {
            video: { facingMode: 'environment' }
          },
          videoRef.current,
          (result, err) => {
            if (!mounted) return;
            if (result) onScan(result.getText());
            if (err && onError) onError(err);
          }
        );
      } catch (err) {
        if (mounted && onError) onError(err);
      }
    }

    startScanning();

    return () => {
      mounted = false;
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, [onScan, onError]);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 border-2 border-[#4ADE80] rounded-2xl" />
    </div>
  );
} 