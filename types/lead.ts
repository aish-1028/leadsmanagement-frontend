export type LeadStatus = "New" | "Engaged" | "Proposal Sent" | "Closed-Won" | "Closed-Lost"

export interface Lead {
  id: string
  name: string
  email: string
  status: LeadStatus
  phone?: string
  city?: string
  workExp?: "Freshers" | "1-3 Yr Exp" | "3-5 Yr Exp" | "5-10 Yr Exp" | "10+ Yr Exp" | "Working"
  financeDomain?: string[]
  leadStage?: string
  details?: string
  followUpDetails?: string
  counsellor?: string
  calledOn?: string
  createdAt: string
}
