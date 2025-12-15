"use client"

import { useState, useEffect, useRef } from "react"
import { useSupabase } from "@/lib/supabase/provider"
import { toast } from "sonner"
import { Camera, Play, RotateCcw } from "lucide-react"
import type { Member } from "@/lib/mock-data"

interface RecognizedMember extends Member {
  confidence?: number;
}

export default function LiveAccessPage() {
  const { members, recordAttendance, gateStatus, setGateStatus } = useSupabase()
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [recognizedMember, setRecognizedMember] = useState<RecognizedMember | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isCameraActive) {
      startCamera()
    }
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isCameraActive])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      toast.error("Unable to access camera")
      setIsCameraActive(false)
    }
  }

  const simulateFaceDetection = async () => {
    if (members.length === 0) {
      toast.error("No members in database")
      return
    }

    setIsRecognizing(true)

    // Simulate face detection delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Randomly select an active member
    const activeMemberList = members.filter((m) => m.status === "active")
    if (activeMemberList.length === 0) {
      toast.error("No active members found")
      setIsRecognizing(false)
      return
    }

    const randomMember = activeMemberList[Math.floor(Math.random() * activeMemberList.length)]
    setRecognizedMember(randomMember)
    setShowWelcome(true)
    setIsRecognizing(false)

    try {
      // Trigger gate open
      await setGateStatus("open")
      toast.success(`Face Recognized: ${randomMember.name}`)

      // Record attendance - using snake_case to match database schema
      const now = new Date();
      console.log('Recording attendance for member:', randomMember.id, 'at:', now);
      
      const attendanceData = {
        memberId: randomMember.id,
        timestamp: now,
        method: "face",
        entryTime: now,
        exitTime: null,
      };
      
      console.log('Sending attendance data:', attendanceData);
      await recordAttendance(attendanceData);

      // Auto close gate and hide welcome after 3 seconds
      setTimeout(async () => {
        await setGateStatus("closed")
        setShowWelcome(false)
        setRecognizedMember(null)
      }, 3000)
    } catch (error) {
      console.error('Error in face detection flow:', error)
      toast.error('Error processing face recognition')
      setShowWelcome(false)
      setRecognizedMember(null)
      setIsRecognizing(false)
    }
  }

  const resetKiosk = () => {
    setShowWelcome(false)
    setRecognizedMember(null)
    setIsRecognizing(false)
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Live Access - Face Recognition</h1>
        <p className="text-muted-foreground text-opacity-80 mt-1">Reception Kiosk Mode - Member Check-in</p>
      </div>

      <div className="flex-1 flex gap-6">
        {/* Camera Feed */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black rounded-lg overflow-hidden border border-border relative">
            {isCameraActive ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                {isRecognizing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-white font-semibold mt-4">Recognizing...</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center flex-col gap-4 text-muted">
                <Camera className="w-16 h-16 opacity-50" />
                <p>Camera inactive</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-4">
            <button
              onClick={() => setIsCameraActive(!isCameraActive)}
              className={`flex-1 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-white ${
                isCameraActive
                  ? "bg-black hover:bg-opacity-90"
                  : "bg-black hover:bg-opacity-80"
              }`}
            >
              <Camera className="w-5 h-5" />
              {isCameraActive ? "Stop Camera" : "Start Camera"}
            </button>
          </div>
        </div>

        {/* Recognition Panel */}
        <div className="w-80 flex flex-col gap-4">
          {showWelcome && recognizedMember ? (
            <div className="bg-card p-6 rounded-lg border border-border h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-success overflow-hidden mx-auto">
                  <img
                    src={recognizedMember.photoUrl || "/placeholder.svg"}
                    alt={recognizedMember.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center">
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
              </div>

              <div className="w-full h-1 bg-success rounded-full overflow-hidden mt-4">
                <div className="h-full bg-success animate-pulse" />
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
                <p className="text-sm text-muted-foreground text-opacity-80 mt-2">Position your face in front of the camera</p>
              </div>

              <button
                onClick={simulateFaceDetection}
                disabled={isRecognizing || !isCameraActive}
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-auto"
              >
                <Play className="w-5 h-5" />
                Simulate Face Detection
              </button>

              <button
                onClick={resetKiosk}
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reset Kiosk
              </button>

              <div className="mt-4 p-3 bg-background rounded-lg text-xs text-muted">
                <p>Active Members: {members.filter((m) => m.status === "active").length}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
