"use client"

import { createContext, useContext } from "react"
import type { Member, AttendanceRecord } from "./mock-data"

export interface GymContextType {
  members: Member[]
  attendance: AttendanceRecord[]
  gateStatus: "open" | "closed"
  setGateStatus: (status: "open" | "closed") => void
  addMember: (member: Member) => void
  recordAttendance: (record: AttendanceRecord) => void
}

export const GymContext = createContext<GymContextType | undefined>(undefined)

export const useGym = () => {
  const context = useContext(GymContext)
  if (!context) {
    throw new Error("useGym must be used within GymProvider")
  }
  return context
}
