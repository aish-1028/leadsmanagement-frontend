// This is a new component for adding leads
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { apiClient, User } from "@/lib/api"
import { useAuth } from "@/lib/auth"

type FormData = { name: string; email: string; phone?: string, city?: string, workExp?: string, financeDomain?: string, details?: string, followUpDetails?: string, counsellor?: string, visitingDate?: Date, visitDoneDate?: Date, counsellorWhoTookVisit?: string, calledOn?: Date, status: string, }

export default function NewLeadPage(): React.ReactElement {
  const router = useRouter()
  const { ensureAuth } = useAuth()
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", phone: "", city: "", workExp: "", financeDomain: "", details: "", followUpDetails: "", counsellor: "", visitingDate: undefined, visitDoneDate: undefined, counsellorWhoTookVisit: "", calledOn: undefined, status: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [counsellors, setCounsellors] = useState<User[]>([])

  useEffect(() => {
    ensureAuth()
    fetchCounsellors()
  }, [])

  const fetchCounsellors = async () => {
    try {
      const res = await apiClient.getUsers()
      if (res.success && res.data) {
        // Filter out admin users
        const nonAdminUsers = res.data.filter(user => user.role !== 'admin')
        setCounsellors(nonAdminUsers)
      }
    } catch (error) {
      console.error('Failed to fetch counsellors:', error)
    }
  }

  const handleChange = (k: keyof FormData, v: any) => setFormData((p) => ({ ...p, [k]: v }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await apiClient.createLead(formData as any)
      if (res.success) router.push("/leads")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Add New Lead</h1>
        <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">City</label>
            <input value={formData.city} onChange={(e) => handleChange("city", e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Work Experience</label>
            <select value={formData.workExp} onChange={(e) => handleChange("workExp", e.target.value)} className="w-full border p-2 rounded">
              <option value="">Select Work Experience</option>
              <option value="Freshers">Freshers</option>
              <option value="1-3 Yr Exp">1-3 Yr Exp</option>
              <option value="3-5 Yr Exp">3-5 Yr Exp</option>
              <option value="5-10 Yr Exp">5-10 Yr Exp</option>
              <option value="10+ Yr Exp">10+ Yr Exp</option>
              <option value="Working">Working</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Finance Domain</label>
            <select value={formData.financeDomain} onChange={(e) => handleChange("financeDomain", e.target.value)} className="w-full border p-2 rounded">
              <option value="">Select Finance Domain</option>
              <option value="Financial Analyst">Financial Analyst</option>
              <option value="Investment Banking">Investment Banking</option>
              <option value="FP&A Analyst">FP&A Analyst</option>
              <option value="Financial Modelling Valuation">Financial Modelling Valuation</option>
              <option value="Business Analyst">Business Analyst</option>
              <option value="Credit Research Analyst">Credit Research Analyst</option>
              <option value="Financial Modelling Equity Research">Financial Modelling Equity Research</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Details</label>
            <textarea value={formData.details} onChange={(e) => handleChange("details", e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Follow Up Details</label>
            <textarea value={formData.followUpDetails} onChange={(e) => handleChange("followUpDetails", e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Counsellor</label>
            <select value={formData.counsellor} onChange={(e) => handleChange("counsellor", e.target.value)} className="w-full border p-2 rounded">
              <option value="">Select Counsellor</option>
              {counsellors.map((counsellor) => (
                <option key={counsellor.id} value={counsellor.name}>
                  {counsellor.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Called On</label>
            <input type="date" value={formData.calledOn?.toISOString().split("T")[0]} onChange={(e) => handleChange("calledOn", new Date(e.target.value))} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select value={formData.status} onChange={(e) => handleChange("status", e.target.value)} className="w-full border p-2 rounded">
              <option value="">Select Status</option>
              <option value="Just Casual Enquiry">Just Casual Enquiry</option>
              <option value="Not receiving">Not receiving</option>
              <option value="Lead Forward">Lead Forward</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Interested but Fees Budget Issue">Interested but Fees Budget Issue</option>
              <option value="Planning to visit FINXL office">Planning to visit FINXL office</option>
              <option value="Want Offline Class Other than Pune City">Want Offline Class Other than Pune City</option>
              <option value="Visit Done">Visit Done</option>
              <option value="Payment Details Shared for Admission">Payment Details Shared for Admission</option>
              <option value="Admission Done">Admission Done</option>
              <option value="Joined Another Institute">Joined Another Institute</option>
              <option value="Online Live">Online Live</option>
              <option value="Interested Details Shared Follow up call back">Interested Details Shared Follow up call back</option>
              <option value="Not Eligible">Not Eligible</option>
              <option value="Follow Up">Follow Up</option>
            </select>
          </div>
          {formData.status === "Planning to visit FINXL office" && (
            <div>
              <label className="block text-sm font-medium">Visiting Date</label>
              <input type="date" value={formData.visitingDate?.toISOString().split("T")[0]} onChange={(e) => handleChange("visitingDate", new Date(e.target.value))} className="w-full border p-2 rounded" />
            </div>
          )}
          {formData.status === "Visit Done" && (
            <>
              <div>
                <label className="block text-sm font-medium">Visit Done Date</label>
                <input type="date" value={formData.visitDoneDate?.toISOString().split("T")[0]} onChange={(e) => handleChange("visitDoneDate", new Date(e.target.value))} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Counsellor Who Took Visit</label>
                <select value={formData.counsellorWhoTookVisit} onChange={(e) => handleChange("counsellorWhoTookVisit", e.target.value)} className="w-full border p-2 rounded">
                  <option value="">Select Counsellor</option>
                  {counsellors.map((counsellor) => (
                    <option key={counsellor.id} value={counsellor.name}>
                      {counsellor.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded">
              {isSubmitting ? "Creating..." : "Create Lead"}
            </button>
            <Link href="/leads" className="px-4 py-2 border rounded">Cancel</Link>
          </div>
        </form>
      </div>
    </main>
  )
}
