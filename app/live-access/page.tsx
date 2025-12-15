"use client"

import { useState, useEffect, useRef } from "react"
import { useSupabase } from "@/lib/supabase/provider"
import { toast } from "sonner"
import { Camera, RotateCcw, AlertCircle } from "lucide-react"
import type { Member } from "@/lib/mock-data"
import * as faceapi from "face-api.js"
import { useFaceApi } from "@/lib/hooks/useFaceApi"

interface RecognizedMember extends Member {
  confidence?: number
  distance?: number
}

export default function LiveAccessPage() {
  const { members, recordAttendance, gateStatus, setGateStatus } = useSupabase()
  const { modelsLoaded, isLoading: modelsLoading, error: modelError } = useFaceApi()

  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recognizedMember, setRecognizedMember] = useState<RecognizedMember | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastRecognitionRef = useRef<number>(0)

  useEffect(() => {
    if (modelsLoaded && members.length > 0) {
      initializeFaceMatcher()
    }
  }, [modelsLoaded, members])

  useEffect(() => {
    return () => {
      stopCamera()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const initializeFaceMatcher = () => {
    try {
      const activeMembers = members.filter(m => m.status === 'active' && m.faceDescriptor)

      if (activeMembers.length === 0) {
        console.warn('No active members with face descriptors found')
        return
      }

      const labeledDescriptors = activeMembers.map(member => {
        const descriptor = Array.isArray(member.faceDescriptor)
          ? new Float32Array(member.faceDescriptor)
          : member.faceDescriptor

        return new faceapi.LabeledFaceDescriptors(
          member.id,
          [descriptor as Float32Array]
        )
      })

      const matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6)
      setFaceMatcher(matcher)
      console.log(`Face matcher initialized with ${activeMembers.length} members`)
    } catch (error) {
      console.error('Error initializing face matcher:', error)
      toast.error('Failed to initialize face recognition system')
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream

        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setIsCameraActive(true)
          startDetectionLoop()
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error("Unable to access camera")
      setIsCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setIsCameraActive(false)
  }

  const startDetectionLoop = () => {
    const detect = async () => {
      if (!videoRef.current || !canvasRef.current || !modelsLoaded || !faceMatcher || !isCameraActive) {
        animationFrameRef.current = requestAnimationFrame(detect)
        return
      }

      const video = videoRef.current
      const canvas = canvasRef.current

      if (video.readyState !== 4) {
        animationFrameRef.current = requestAnimationFrame(detect)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        animationFrameRef.current = requestAnimationFrame(detect)
        return
      }

      const now = Date.now()
      if (now - lastRecognitionRef.current < 500) {
        animationFrameRef.current = requestAnimationFrame(detect)
        return
      }

      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptor()

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (detection) {
          const { box } = detection.detection
          const bestMatch = faceMatcher.findBestMatch(detection.descriptor)

          const isMatch = bestMatch.label !== 'unknown'
          const member = isMatch ? members.find(m => m.id === bestMatch.label) : null

          ctx.strokeStyle = isMatch ? '#10b981' : '#ef4444'
          ctx.lineWidth = 3
          ctx.strokeRect(box.x, box.y, box.width, box.height)

          ctx.fillStyle = isMatch ? '#10b981' : '#ef4444'
          ctx.fillRect(box.x, box.y - 30, box.width, 30)

          ctx.fillStyle = '#ffffff'
          ctx.font = '16px Arial'
          ctx.fillText(
            isMatch ? member?.name || 'Match' : 'Unknown',
            box.x + 5,
            box.y - 10
          )

          if (isMatch && member && !isProcessing) {
            lastRecognitionRef.current = now
            await handleMemberRecognized(member, bestMatch.distance)
          }
        }
      } catch (error) {
        console.error('Detection error:', error)
      }

      animationFrameRef.current = requestAnimationFrame(detect)
    }

    detect()
  }

  const handleMemberRecognized = async (member: Member, distance: number) => {
    setIsProcessing(true)

    try {
      setRecognizedMember({
        ...member,
        distance,
        confidence: 1 - distance
      })
      setShowWelcome(true)

      await setGateStatus("open")
      toast.success(`Access Granted: ${member.name}`)

      const now = new Date()
      await recordAttendance({
        memberId: member.id,
        timestamp: now,
        method: "face",
        entryTime: now,
      })

      setTimeout(async () => {
        await setGateStatus("closed")
        setShowWelcome(false)
        setRecognizedMember(null)
        setIsProcessing(false)
      }, 3000)

    } catch (error) {
      console.error('Error processing recognition:', error)
      toast.error('Error processing face recognition')
      setShowWelcome(false)
      setRecognizedMember(null)
      setIsProcessing(false)
    }
  }

  const resetKiosk = () => {
    setShowWelcome(false)
    setRecognizedMember(null)
    setIsProcessing(false)
    lastRecognitionRef.current = 0
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Live Access - Face Recognition</h1>
        <p className="text-muted-foreground text-opacity-80 mt-1">Reception Kiosk Mode - Member Check-in</p>
      </div>

      {modelError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-semibold text-red-500">Error Loading AI Models</p>
            <p className="text-sm text-red-400">{modelError}</p>
          </div>
        </div>
      )}

      {modelsLoading && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
          <p className="font-semibold text-blue-400">Loading AI Models...</p>
          <p className="text-sm text-blue-300 mt-1">Please wait while face recognition models are loaded</p>
        </div>
      )}

      <div className="flex-1 flex gap-6">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black rounded-lg overflow-hidden border border-border relative">
            {isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center flex-col gap-4 text-muted">
                <Camera className="w-16 h-16 opacity-50" />
                <p>Camera inactive</p>
                {!modelsLoaded && !modelsLoading && (
                  <p className="text-sm text-yellow-500">Waiting for AI models to load...</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-4">
            <button
              onClick={isCameraActive ? stopCamera : startCamera}
              disabled={modelsLoading || !modelsLoaded}
              className={`flex-1 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-white ${
                isCameraActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              } ${(modelsLoading || !modelsLoaded) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Camera className="w-5 h-5" />
              {isCameraActive ? "Stop Camera" : "Start Camera"}
            </button>
          </div>
        </div>

        <div className="w-80 flex flex-col gap-4">
          {showWelcome && recognizedMember ? (
            <div className="bg-card p-6 rounded-lg border border-border h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-green-500 overflow-hidden mx-auto">
                  <img
                    src={recognizedMember.photoUrl || "/placeholder.svg"}
                    alt={recognizedMember.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-black text-lg">✓</span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold">Welcome!</h2>
                <p className="text-xl font-semibold text-primary mt-2">{recognizedMember.name}</p>
              </div>

              <div className="w-full bg-background p-4 rounded-lg space-y-2 text-sm">
                <div>
                  <p className="text-muted">Status</p>
                  <p className="font-medium capitalize">{recognizedMember.status}</p>
                </div>
                <div>
                  <p className="text-muted">Plan Expires</p>
                  <p className="font-medium">{new Date(recognizedMember.planEndDate).toLocaleDateString()}</p>
                </div>
                {recognizedMember.distance !== undefined && (
                  <div>
                    <p className="text-muted">Match Score</p>
                    <p className="font-medium">{((1 - recognizedMember.distance) * 100).toFixed(1)}%</p>
                  </div>
                )}
              </div>

              <div className="w-full h-1 bg-green-500 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-green-500 animate-pulse" />
              </div>
              <p className="text-xs text-muted">Gate opening...</p>
            </div>
          ) : (
            <div className="bg-card p-6 rounded-lg border border-border h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center">
                <Camera className="w-10 h-10 text-primary" />
              </div>

              <div>
                <h2 className="text-lg font-bold">Ready for Detection</h2>
                <p className="text-sm text-muted-foreground text-opacity-80 mt-2">
                  {!modelsLoaded ? 'Loading AI models...' :
                   !isCameraActive ? 'Start camera to begin' :
                   'Position your face in front of the camera'}
                </p>
              </div>

              {isCameraActive && (
                <button
                  onClick={resetKiosk}
                  className="w-full bg-card-hover hover:bg-border text-foreground font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset Kiosk
                </button>
              )}

              <div className="mt-4 p-3 bg-background rounded-lg text-xs text-muted w-full">
                <p className="font-semibold mb-2">System Status:</p>
                <p>Models: {modelsLoaded ? '✓ Loaded' : modelsLoading ? '⏳ Loading...' : '✗ Not Loaded'}</p>
                <p>Camera: {isCameraActive ? '✓ Active' : '✗ Inactive'}</p>
                <p>Active Members: {members.filter(m => m.status === "active" && m.faceDescriptor).length}</p>
                <p>Face Matcher: {faceMatcher ? '✓ Ready' : '✗ Not Ready'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
