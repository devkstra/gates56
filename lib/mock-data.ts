export interface Member {
  id: string
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

export interface AttendanceRecord {
  id: string
  memberId: string
  timestamp: Date
  method: "face" | "qr"
  entryTime: Date
  exitTime?: Date
}

// Initialize mock members
export const mockMembers: Member[] = [
  {
    id: "1",
    name: "John Anderson",
    phone: "+1-555-0101",
    email: "john@example.com",
    age: 28,
    gender: "M",
    plan: "1-year",
    planStartDate: new Date("2024-01-15"),
    planEndDate: new Date("2025-01-15"),
    status: "active",
    photoUrl: "/male-gym-member.jpg",
    lastVisitDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    joinDate: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Sarah Mitchell",
    phone: "+1-555-0102",
    email: "sarah@example.com",
    age: 32,
    gender: "F",
    plan: "3-months",
    planStartDate: new Date("2024-08-01"),
    planEndDate: new Date("2024-11-01"),
    status: "active",
    photoUrl: "/female-gym-member.jpg",
    lastVisitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    joinDate: new Date("2024-08-01"),
  },
  {
    id: "3",
    name: "Mike Chen",
    phone: "+1-555-0103",
    email: "mike@example.com",
    age: 25,
    gender: "M",
    plan: "1-month",
    planStartDate: new Date("2024-10-15"),
    planEndDate: new Date("2024-11-15"),
    status: "active",
    photoUrl: "/asian-gym-member.jpg",
    lastVisitDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    joinDate: new Date("2024-10-15"),
  },
  {
    id: "4",
    name: "Emma Rodriguez",
    phone: "+1-555-0104",
    email: "emma@example.com",
    age: 29,
    gender: "F",
    plan: "1-year",
    planStartDate: new Date("2023-11-01"),
    planEndDate: new Date("2024-11-01"),
    status: "expired",
    photoUrl: "/latin-female-gym.jpg",
    lastVisitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    joinDate: new Date("2023-11-01"),
  },
  {
    id: "5",
    name: "James Wilson",
    phone: "+1-555-0105",
    email: "james@example.com",
    age: 35,
    gender: "M",
    plan: "3-months",
    planStartDate: new Date("2024-08-20"),
    planEndDate: new Date("2024-11-20"),
    status: "active",
    photoUrl: "/older-male-gym.jpg",
    lastVisitDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    joinDate: new Date("2024-08-20"),
  },
]

// Generate attendance data for the last 7 days
export const generateAttendanceData = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = []
  const now = new Date()

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 7)
    const hour = Math.floor(Math.random() * 12) + 6 // 6 AM to 6 PM
    const minute = Math.floor(Math.random() * 60)

    const timestamp = new Date(now)
    timestamp.setDate(timestamp.getDate() - daysAgo)
    timestamp.setHours(hour, minute, 0)

    records.push({
      id: `att-${i}`,
      memberId: mockMembers[Math.floor(Math.random() * mockMembers.length)].id,
      timestamp,
      method: Math.random() > 0.7 ? "qr" : "face",
      entryTime: timestamp,
    })
  }

  return records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export const attendanceRecords = generateAttendanceData()
