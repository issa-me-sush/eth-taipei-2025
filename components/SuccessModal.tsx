import { useEffect } from 'react';

interface SuccessModalProps {
  message: string;
  onClose: () => void;
}

export default function SuccessModal({ message, onClose }: SuccessModalProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-2xl p-6 shadow-lg max-w-sm w-full mx-4 transform animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#4ADE80] flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2">Success!</h3>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
} 