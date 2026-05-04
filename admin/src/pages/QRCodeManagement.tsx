import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, QrCode, Check, ExternalLink, HelpCircle, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const DEFAULT_LOCAL_URL = 'http://localhost:5175';

export function QRCodeManagement() {
  const [userAppUrl, setUserAppUrl] = useState(DEFAULT_LOCAL_URL);
  const [qrSize, setQrSize] = useState(256);
  const [copied, setCopied] = useState(false);
  const [showNgrokGuide, setShowNgrokGuide] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const isNgrok = userAppUrl.includes('ngrok');

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(userAppUrl);
      setCopied(true);
      toast.success('Đã copy URL vào clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể copy URL');
    }
  };

  const handleDownloadPNG = () => {
    if (!qrRef.current) return;

    const canvas = document.createElement('canvas');
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'food-tour-qr.png';
      link.href = pngUrl;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Đã tải QR Code (PNG)');
    };
    img.src = url;
  };

  const handleDownloadSVG = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = 'food-tour-qr.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Đã tải QR Code (SVG)');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">QR Code cho Food Tour</h2>
        <p className="text-slate-500">
          Tạo QR Code để dán tại phố đi bộ. Khi người dùng quét, họ sẽ được chuyển đến ứng dụng Food Tour trên điện thoại.
        </p>
      </div>

      <Separator />

      {/* ngrok Guide Toggle */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowNgrokGuide(!showNgrokGuide)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-blue-100/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">Hướng dẫn dùng ngrok cho nhiều thiết bị</h3>
              <p className="text-sm text-blue-700">
                {showNgrokGuide ? 'Ẩn hướng dẫn' : 'Nhấn để xem hướng dẫn'}
              </p>
            </div>
          </div>
          {showNgrokGuide ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-blue-600" />}
        </button>

        {showNgrokGuide && (
          <div className="px-6 pb-6 space-y-4 border-t border-blue-200 pt-4">
            <div className="space-y-3 text-sm text-blue-800">
              <h4 className="font-semibold">Bước 1: Tạo tài khoản ngrok</h4>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Truy cập <a href="https://ngrok.com/signup" target="_blank" rel="noopener noreferrer" className="underline font-medium">ngrok.com/signup</a></li>
                <li>Đăng ký tài khoản miễn phí</li>
                <li>Vào <a href="https://dashboard.ngrok.com/get-started/your-authtoken" target="_blank" rel="noopener noreferrer" className="underline font-medium">Dashboard</a> để lấy Authtoken</li>
              </ol>
            </div>

            <div className="space-y-3 text-sm text-blue-800">
              <h4 className="font-semibold">Bước 2: Cài đặt ngrok</h4>
              <p className="font-mono bg-white/60 p-3 rounded-lg text-xs">
                # Tải từ: https://ngrok.com/download<br />
                # Hoặc dùng npm (nếu có):<br />
                npm install -g ngrok<br />
                <br />
                # Auth với token của bạn:<br />
                ngrok config add-authtoken YOUR_TOKEN
              </p>
            </div>

            <div className="space-y-3 text-sm text-blue-800">
              <h4 className="font-semibold">Bước 3: Chạy tunnels (mở 2 terminal)</h4>
              <p className="font-mono bg-white/60 p-3 rounded-lg text-xs space-y-1">
                # Terminal 1 - Backend API:<br />
                ngrok http 4000<br />
                <br />
                # Terminal 2 - User App:<br />
                ngrok http 5175
              </p>
            </div>

            <div className="space-y-3 text-sm text-blue-800">
              <h4 className="font-semibold">Bước 4: Copy Forwarding URLs</h4>
              <p>Sau khi chạy ngrok, bạn sẽ thấy dạng:</p>
              <p className="font-mono bg-white/60 p-3 rounded-lg text-xs">
                Forwarding: https://abc123.ngrok-free.app -&gt; http://localhost:4000
              </p>
              <p className="font-medium">Copy 2 URLs này vào ô cấu hình bên dưới.</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-800 space-y-1">
              <p className="font-semibold">⚠️ Lưu ý:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>URL ngrok thay đổi mỗi lần restart</li>
                <li>Cần chạy tunnels trước khi in QR</li>
                <li>Khi quét QR trên điện thoại, ngrok sẽ hiện "Visit Site" - nhấn để vào app</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* QR Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mr-3">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Xem trước QR Code</h3>
              <p className="text-sm text-slate-500">Quét để test trên điện thoại</p>
            </div>
          </div>

          <div ref={qrRef} className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-center">
            <QRCodeSVG
              value={userAppUrl}
              size={qrSize}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="mt-4 text-center space-y-1">
            {isNgrok && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                🌐 Public - Truy cập từ mọi thiết bị
              </span>
            )}
            <p className="text-xs text-slate-400 break-all">{userAppUrl}</p>
          </div>
        </div>

        {/* Settings & Actions */}
        <div className="space-y-6">
          {/* URL Configuration */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Cấu hình URLs</h3>

            <div className="space-y-2">
              <Label htmlFor="user-app-url">URL ứng dụng User (cho QR Code)</Label>
              <Input
                id="user-app-url"
                value={userAppUrl}
                onChange={(e) => setUserAppUrl(e.target.value)}
                placeholder="https://xyz456.ngrok-free.app"
              />
              <p className="text-xs text-slate-500">
                {isNgrok
                  ? '✅ URL public - điện thoại có thể truy cập từ mọi nơi'
                  : '⚠️ Localhost - chỉ hoạt động trên máy này'}
              </p>
            </div>
          </div>

          {/* QR Size */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Kích thước QR</h3>
            <div className="space-y-2">
              <Label htmlFor="qr-size">{qrSize}px</Label>
              <input
                id="qr-size"
                type="range"
                min="128"
                max="512"
                step="64"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>128px</span>
                <span>512px</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">Tải về & Chia sẻ</h3>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleDownloadPNG} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Tải PNG
              </Button>
              <Button variant="outline" onClick={handleDownloadSVG} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Tải SVG
              </Button>
            </div>

            <Button variant="outline" onClick={handleCopyUrl} className="w-full">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Đã copy!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </>
              )}
            </Button>

            <Button variant="outline" onClick={() => window.open(userAppUrl, '_blank')} className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Mở ứng dụng
            </Button>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-2">
            <h4 className="font-semibold text-amber-800 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Lưu ý khi in QR
            </h4>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>In QR với kích thước tối thiểu 5x5cm</li>
              <li>Dán tại vị trí dễ thấy, có ánh sáng tốt</li>
              <li>Test QR trên nhiều điện thoại trước khi in hàng loạt</li>
              <li>Khi dùng ngrok: URL thay đổi mỗi lần restart tunnels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
