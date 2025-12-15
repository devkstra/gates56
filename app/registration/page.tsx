"use client"

import { useState } from "react"
import RegistrationForm from "@/components/registration-form"
import CameraCapture from "@/components/camera-capture"

export default function RegistrationPage() {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Member Registration</h1>
        <p className="text-muted-foreground text-opacity-80 mt-1">Register new members and capture their Face ID</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CameraCapture onPhotoCapture={setCapturedPhoto} />
        <RegistrationForm capturedPhoto={capturedPhoto} />
      </div>
    </div>
  )
}
