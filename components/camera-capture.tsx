"use client"

import { useRef, useState, ChangeEvent } from "react"
import { Camera, Check, Upload, X } from "lucide-react"
import { toast } from "sonner"

interface CameraCaptureProps {
  onPhotoCapture: (photo: string) => void
}

export default function CameraCapture({ onPhotoCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const startCamera = async () => {
    try {
      console.log('Requesting camera access...')
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      };
      
      // Check if browser supports mediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser does not support camera access')
      }
      
      // List available devices for debugging
      const devices = await navigator.mediaDevices.enumerateDevices()
      console.log('Available devices:', devices)
      
      // Stop any existing stream first
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('Got stream:', stream)
      
      if (videoRef.current) {
        console.log('Setting video source...')
        videoRef.current.srcObject = stream;
        
        // Set up event listeners for debugging
        const onLoadedMetadata = () => {
          console.log('Video metadata loaded')
          videoRef.current?.play().then(() => {
            console.log('Video is playing')
            setIsCameraActive(true)
          }).catch(err => {
            console.error('Error playing video:', err)
            toast.error("Error starting camera preview")
          })
        }
        
        videoRef.current.onloadedmetadata = onLoadedMetadata;
        
        // For browsers that don't fire loadedmetadata event
        const timeout = setTimeout(() => {
          if (videoRef.current && !isCameraActive && videoRef.current.readyState >= 2) {
            onLoadedMetadata();
          }
        }, 1000);
        
        videoRef.current.onerror = (e) => {
          console.error('Video error:', e)
          clearTimeout(timeout);
          toast.error("Error accessing camera")
        }
        
        // Cleanup function
        return () => {
          clearTimeout(timeout);
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = null;
            videoRef.current.onerror = null;
          }
        };
      }
    } catch (err) {
      console.error('Camera error:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          toast.error("Camera access was denied. Please check your browser permissions.")
        } else if (err.name === 'NotFoundError') {
          toast.error("No camera found. Please connect a camera and try again.")
        } else {
          toast.error(`Camera error: ${err.message}`)
        }
      } else {
        toast.error("Unable to access camera. Please check your browser permissions.")
      }
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 640, 480)
        const photoData = canvasRef.current.toDataURL("image/jpeg")
        setCapturedImage(photoData)
        onPhotoCapture(photoData)
        toast.success("Photo captured successfully!")
        stopCamera()
      }
    }
  }

  const resetCapture = () => {
    setCapturedImage(null)
    onPhotoCapture("")
  }

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const photoData = event.target?.result as string
      setCapturedImage(photoData)
      onPhotoCapture(photoData)
      toast.success('Photo uploaded successfully!')
    }
    reader.onerror = () => {
      toast.error('Error reading file')
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="bg-card p-6 rounded-lg border border-border space-y-6">
      <h2 className="text-xl font-bold">Capture Face ID</h2>

      {!capturedImage ? (
        <div className="space-y-6">
          {isCameraActive ? (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden w-full aspect-video">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
                />
                {!isCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center p-4 bg-black/50 rounded-lg">
                      <div className="animate-pulse">
                        <Camera className="w-12 h-12 mx-auto mb-2" />
                        <p>Starting camera...</p>
                      </div>
                    </div>
                  </div>
                )}
                <canvas 
                  ref={canvasRef} 
                  width={1280} 
                  height={720} 
                  className="hidden" 
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Capture Face ID
                </button>
                <button
                  onClick={stopCamera}
                  className="flex-1 bg-danger hover:bg-opacity-90 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Stop Camera
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={startCamera}
                className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Start Camera
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">OR</span>
                </div>
              </div>

              <div>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
                  className="w-full cursor-pointer bg-card hover:bg-accent/10 text-accent-foreground font-medium py-4 rounded-lg border-2 border-dashed border-accent/50 flex flex-col items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Photo</span>
                  <span className="text-xs text-muted-foreground">JPG, PNG (max 5MB)</span>
                </label>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden bg-black">
            <img 
              src={capturedImage} 
              alt="Captured Face ID" 
              className="w-full h-auto max-h-[500px] object-contain" 
            />
          </div>
          <p className="text-sm text-success font-medium flex items-center gap-2">
            <Check className="w-4 h-5" />
            Photo captured and ready for registration
          </p>
          <div className="flex gap-3">
            <button
              onClick={resetCapture}
              className="flex-1 bg-card-hover hover:bg-border text-foreground font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Take New Photo
            </button>
            <button
              onClick={resetCapture}
              className="flex-1 bg-accent/10 hover:bg-accent/20 text-accent-foreground font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Different
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
