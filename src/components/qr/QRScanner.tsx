import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '../ui/Button';
import {
  Camera,
  RefreshCw,
  VideoOff,
  SwitchCamera,
  CheckCircle2,
  Upload,
} from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
  className?: string;
  fps?: number;
  qrbox?: number;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanError,
  className = '',
  fps = 10,
  qrbox = 250,
}) => {
  const containerId = 'tp-qr-reader-viewport';
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Stop scanner function
  const stopScanner = useCallback(async () => {
    if (qrCodeScannerRef.current) {
      try {
        if (qrCodeScannerRef.current.isScanning) {
          await qrCodeScannerRef.current.stop();
        }
        qrCodeScannerRef.current.clear();
      } catch {
        // Silently catch cleanup issues
      }
      qrCodeScannerRef.current = null;
      setIsScanning(false);
    }
  }, []);

  // Start scanner function
  const startScanner = useCallback(
    async (mode: 'environment' | 'user') => {
      setCameraError(null);
      await stopScanner();

      try {
        const scanner = new Html5Qrcode(containerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        qrCodeScannerRef.current = scanner;

        // Discover cameras if possible
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            setCameras(devices as unknown as MediaDeviceInfo[]);
          }
        } catch {
          // Ignore camera list fetch failure
        }

        const config = {
          fps,
          qrbox: { width: qrbox, height: qrbox },
          aspectRatio: 1.0,
        };

        await scanner.start(
          { facingMode: mode },
          config,
          (decodedText: string) => {
            setLastScanned(decodedText);
            onScanSuccess(decodedText);
          },
          (errorMessage: string) => {
            // Transient frame decode failures are normal in video streams
            if (onScanError && errorMessage.includes('NotFoundException')) {
              // Ignore standard frame miss
            } else if (onScanError) {
              onScanError(errorMessage);
            }
          }
        );

        setIsScanning(true);
      } catch (err: any) {
        let msg = 'Failed to access camera. Please verify camera permissions.';
        if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
          msg = 'Camera access was denied by your browser. Please allow camera permissions or upload a QR image.';
        } else if (err?.name === 'NotFoundError') {
          msg = 'No camera device detected on this hardware.';
        } else if (err?.name === 'NotSupportedError' || window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          msg = 'Camera requires a secure HTTPS context or localhost.';
        }
        setCameraError(msg);
        setIsScanning(false);
      }
    },
    [fps, qrbox, onScanSuccess, onScanError, stopScanner]
  );

  // Initialize camera on mount
  useEffect(() => {
    startScanner(facingMode);

    return () => {
      stopScanner();
    };
  }, [facingMode, startScanner, stopScanner]);

  // Handle switching front/back camera
  const handleToggleCamera = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Handle scanning from uploaded image file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setCameraError(null);

    try {
      const scanner = new Html5Qrcode('tp-qr-file-dummy', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      const decoded = await scanner.scanFile(file, true);
      setLastScanned(decoded);
      onScanSuccess(decoded);
    } catch {
      setCameraError('No valid QR code was detected in the uploaded image.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden dummy element for scanFile */}
      <div id="tp-qr-file-dummy" className="hidden" />

      {/* Camera Viewport Container */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl max-w-sm mx-auto aspect-square flex flex-col items-center justify-center">
        {/* html5-qrcode attaches video here */}
        <div id={containerId} className="w-full h-full" />

        {/* Reticle Overlay when scanning */}
        {isScanning && !cameraError && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
            <div className="w-56 h-56 border-2 border-emerald-400/90 rounded-2xl relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              {/* Corner markers */}
              <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
              <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
              <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br" />

              {/* Animated scanline */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce mt-24 opacity-80" />
            </div>
            <p className="text-[11px] font-semibold text-emerald-300 drop-shadow mt-4 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
              Align QR Code within target frame
            </p>
          </div>
        )}

        {/* Error / Permission Denied Overlay */}
        {cameraError && (
          <div className="absolute inset-0 bg-slate-900/95 p-6 flex flex-col items-center justify-center text-center space-y-3 z-10">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <VideoOff className="w-6 h-6" />
            </div>
            <p className="text-xs text-rose-200 leading-relaxed max-w-xs">{cameraError}</p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1 w-full max-w-xs">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-white border-white/20 hover:bg-white/10"
                onClick={() => startScanner(facingMode)}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry Camera
              </Button>
              <label className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Scanner Controls Bar */}
      <div className="flex items-center justify-between gap-2 max-w-sm mx-auto text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
          <Camera className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {isScanning
              ? `Live • ${facingMode === 'environment' ? 'Back Lens' : 'Front Lens'}`
              : 'Standby'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {cameras.length > 1 && (
            <button
              type="button"
              onClick={handleToggleCamera}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1"
              title="Switch Camera"
            >
              <SwitchCamera className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">Flip Lens</span>
            </button>
          )}

          <label className="p-1.5 px-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload QR</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isProcessingFile}
            />
          </label>
        </div>
      </div>

      {/* Last Scanned Feedback Toast */}
      {lastScanned && (
        <div className="max-w-sm mx-auto p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Detected QR code payload</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
            Received
          </span>
        </div>
      )}
    </div>
  );
};
