import { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function QrScanner({ onScan, onClose }: QrScannerProps) {
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    
    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText) => {
        html5QrCode.stop();
        onScan(decodedText);
      },
      (error) => {
        console.error("QR code scanning failed", error);
      }
    ).catch((err) => {
      console.error("Failed to start scanner", err);
    });

    return () => {
      html5QrCode.stop().catch(console.error);
    };
  }, [onScan]);

  return (
    <div>
      <div id="qr-reader" className="rounded-lg overflow-hidden" />
      <style jsx>{`
        #qr-reader {
          width: 100% !important;
          height: auto !important;
        }
        #qr-reader video {
          width: 100% !important;
          height: auto !important;
        }
      `}</style>
    </div>
  );
} 