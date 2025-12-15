"use client"

import type React from "react"
import { useState } from "react"
import { useSupabase } from "@/lib/supabase/provider"
import { toast } from "sonner"

export interface NewMemberData {
  name: string
  phone: string
  email: string
  age: number
  gender: "M" | "F" | "Other"
  plan: "1-month" | "3-months" | "1-year"
  planStartDate: Date
  planEndDate: Date
  status: "active" | "inactive" | "expired"
  photoUrl?: string
  lastVisitDate?: Date
  joinDate: Date
}

interface RegistrationFormProps {
  capturedPhoto: string | null
  onPhotoClear?: () => void
}

export default function RegistrationForm({ capturedPhoto, onPhotoClear }: RegistrationFormProps) {
  const { addMember, loading } = useSupabase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    age: "",
    gender: "M" as const,
    plan: "1-month" as const,
  })

  const calculatePlanEndDate = (plan: string) => {
    const today = new Date()
    if (plan === "1-month") {
      today.setMonth(today.getMonth() + 1)
    } else if (plan === "3-months") {
      today.setMonth(today.getMonth() + 3)
    } else if (plan === "1-year") {
      today.setFullYear(today.getFullYear() + 1)
    }
    return today
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fullName || !formData.phone || !formData.email) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!capturedPhoto) {
      toast.error("Please capture or upload a photo for Face ID")
      return
    }

    setIsSubmitting(true)

    try {
      // Initialize member data with required fields
      const memberData: Record<string, any> = {
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        age: Number.parseInt(formData.age) || 0,
        gender: formData.gender,
        plan: formData.plan,
        plan_start_date: new Date().toISOString(),
        plan_end_date: calculatePlanEndDate(formData.plan).toISOString(),
        status: "active",
        join_date: new Date().toISOString(),
        last_visit_date: null
      }

      console.log('Preparing to process photo...')
      
      // Process the photo if available
      if (capturedPhoto) {
        try {
          const response = await fetch(capturedPhoto)
          if (!response.ok) throw new Error('Failed to fetch captured photo')
          
          const blob = await response.blob()
          const file = new File([blob], `member-${Date.now()}.jpg`, { 
            type: 'image/jpeg' 
          })
          
          // Convert file to base64 for the API
          const reader = new FileReader()
          const photoBase64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                console.log('Successfully converted photo to base64')
                resolve(reader.result)
              } else {
                reject(new Error('Failed to read file as base64'))
              }
            }
            reader.onerror = (error) => {
              console.error('Error reading file:', error)
              reject(new Error('Failed to read file'))
            }
            reader.readAsDataURL(file)
          })
          
          // Add photo to member data
          memberData.photo_file = photoBase64
        } catch (photoError) {
          console.error('Error processing photo:', photoError)
          toast.error('Error processing photo. Member will be created without a photo.')
        }
      }

      // Send to our API route
      const apiResponse = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData)
      })

      const result = await apiResponse.json()

      if (!apiResponse.ok) {
        throw new Error(result.error || 'Failed to register member')
      }
      
      // Show success message
      toast.success(`Member ${formData.fullName} registered successfully!`)
      
      // Reset form
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        age: "",
        gender: "M",
        plan: "1-month",
      })
      
      // Clear captured photo
      if (typeof onPhotoClear === 'function') {
        onPhotoClear()
      }
      
      // Redirect to dashboard if not already there
      if (window.location.pathname !== '/dashboard') {
        window.location.href = '/dashboard'
      } else {
        // If already on dashboard, trigger a refresh
        window.location.reload()
      }
      
      toast.success(`Member ${formData.fullName} registered successfully!`)

      // Reset form
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        age: "",
        gender: "M",
        plan: "1-month",
      })
    } catch (error) {
      console.error('Error registering member:', error)
      toast.error("Failed to register member. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg border border-border space-y-4">
      <h2 className="text-xl font-bold">Registration Details</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name *</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="John Anderson"
            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone Number *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1-555-0000"
            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="28"
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Membership Plan</label>
          <select
            value={formData.plan}
            onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="1-month">1 Month - ₹1000</option>
            <option value="3-months">3 Months - ₹5000</option>
            <option value="1-year">1 Year - ₹9000</option>
          </select>
        </div>

        {formData.plan && (
          <div className="bg-background p-3 rounded-lg text-sm">
            <p className="text-muted">
              Plan Expiry:{" "}
              <span className="text-foreground font-medium">
                {new Date(calculatePlanEndDate(formData.plan)).toLocaleDateString()}
              </span>
            </p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || loading}
        className={`w-full bg-success hover:bg-success-hover text-black font-semibold py-3 rounded-lg transition-colors mt-6 ${
          (isSubmitting || loading) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting || loading ? 'Registering...' : 'Register Member'}
      </button>
    </form>
  )
}
