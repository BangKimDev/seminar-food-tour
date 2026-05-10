import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Image as ImageIcon } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader", {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false
    });
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText) => {
        // Success
        html5QrCode.stop().then(() => onScanSuccess(decodedText)).catch(console.error);
      },
      (errorMessage) => {
        // Warning / Ignore (fires frequently on no QR)
      }
    ).catch(err => {
      setError("Không thể truy cập Camera. Vui lòng kiểm tra quyền truy cập.");
      console.error(err);
    });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!scannerRef.current) return;
      
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        const decodedText = await scannerRef.current.scanFile(file, true);
        onScanSuccess(decodedText);
      } catch (err) {
        setError("Không tìm thấy mã QR trong ảnh này. Vui lòng thử lại.");
        console.error(err);
      }
    }
  };

  return (
    <>
      <div className="absolute inset-0 bg-black z-[1000] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 text-white z-[1001]">
          <h2 className="text-xl font-bold">Quét mã QR</h2>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full active:scale-95 transition-transform">
            <X size={24} />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
          <div id="qr-reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-3xl" />
          
          {error && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-500 text-white p-4 rounded-xl text-sm text-center w-3/4 max-w-xs shadow-xl z-[1002]">
              {error}
              <button onClick={() => setError(null)} className="block w-full mt-3 bg-white/20 py-2 rounded-lg font-bold">Đóng</button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-8 pb-12 flex justify-center gap-6 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 w-full z-[1001]">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md active:scale-95 transition-transform border border-white/20">
              <ImageIcon size={28} />
            </div>
            <span className="text-xs font-medium tracking-wide">Thư viện ảnh</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handleFileUpload} 
            className="hidden" 
          />
        </div>
      </div>
    </>
  );
};
