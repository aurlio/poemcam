import { X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraModalProps {
  isOpen: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  onClose: () => void;
  onCapture: () => void;
  onFlip: () => void;
}

export function CameraModal({ isOpen, videoRef, onClose, onCapture, onFlip }: CameraModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Camera Preview */}
      <video 
        ref={videoRef}
        className="w-full h-full object-cover" 
        autoPlay 
        playsInline 
        data-testid="camera-preview"
      />
      
      {/* Camera Overlay */}
      <div className="absolute inset-0 camera-viewfinder pointer-events-none" />
      
      {/* Camera Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center justify-between">
          {/* Close Button */}
          <Button
            variant="secondary"
            size="icon"
            onClick={onClose}
            className="w-12 h-12 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
            data-testid="button-close-camera"
          >
            <X className="w-6 h-6" />
          </Button>
          
          {/* Capture Button */}
          <Button
            onClick={onCapture}
            className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-primary transition-colors p-0"
            data-testid="button-capture-photo"
          >
            <div className="w-12 h-12 bg-primary rounded-full" />
          </Button>
          
          {/* Flip Camera Button */}
          <Button
            variant="secondary"
            size="icon"
            onClick={onFlip}
            className="w-12 h-12 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
            data-testid="button-flip-camera"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
