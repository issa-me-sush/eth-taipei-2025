import { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface QRCodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: Error) => void;
}

export default function QRCodeScanner({ onScan, onError }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let isComponentMounted = true;

    const startScanning = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        const selectedDeviceId = videoInputDevices[0]?.deviceId;

        if (!selectedDeviceId) {
          throw new Error('No camera found');
        }

        await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            if (!isComponentMounted) return;

            if (result) {
              onScan(result.getText());
            }
            if (error && onError) {
              onError(error);
            }
          }
        );
      } catch (error) {
        if (onError && isComponentMounted) {
          onError(error instanceof Error ? error : new Error('Failed to start scanner'));
        }
      }
    };

    startScanning();

    return () => {
      isComponentMounted = false;
      codeReader.stopStreams();
    };
  }, [onScan, onError]);

  return (
    <div className="relative aspect-square w-full max-w-md mx-auto">
      <video
        ref={videoRef}
        className="w-full h-full rounded-lg object-cover"
      />
      <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
        <div className="absolute inset-0 border-[3px] border-blue-500 rounded-lg opacity-50 animate-pulse" />
      </div>
    </div>
  );
} 