"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { apiClient, type LeadStatus, type LeadResponse } from "@/lib/api"
import { useAuth } from "@/lib/auth"

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Edit Lead Modal Component
function EditLeadModal({ lead, onClose, onSave, loading }: { lead: any; onClose: () => void; onSave: (data: any) => void; loading: boolean }) {
  const [formData, setFormData] = useState({
    name: lead.name || "",
    email: lead.email || "",
    phone: lead.phone || "",
    city: lead.city || "",
    workExp: lead.workExp || "",
    financeDomain: lead.financeDomain || "",
    status: lead.status || "Just Casual Enquiry",
    details: lead.details || "",
    followUpDetails: lead.followUpDetails || "",
    counsellor: lead.counsellor || "",
    visitingDate: lead.visitingDate ? new Date(lead.visitingDate).toISOString().split('T')[0] : "",
    visitDoneDate: lead.visitDoneDate ? new Date(lead.visitDoneDate).toISOString().split('T')[0] : "",
    counsellorWhoTookVisit: lead.counsellorWhoTookVisit || "",
    calledOn: lead.calledOn ? new Date(lead.calledOn).toISOString().split('T')[0] : "",
  })
  const [counsellors, setCounsellors] = useState<any[]>([])

  useEffect(() => {
    fetchCounsellors()
  }, [])

  const fetchCounsellors = async () => {
    try {
      const res = await apiClient.getUsers()
      if (res.success && res.data) {
        // Filter out admin users
        const nonAdminUsers = res.data.filter((user: any) => user.role !== 'admin')
        setCounsellors(nonAdminUsers)
      }
    } catch (error) {
      console.error('Failed to fetch counsellors:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedData = {
      ...formData,
      calledOn: formData.calledOn ? new Date(formData.calledOn).toISOString() : undefined,
    }
    onSave(updatedData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Edit Lead</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Work Experience</label>
              <select
                value={formData.workExp}
                onChange={(e) => handleChange("workExp", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Experience</option>
                <option value="Freshers">Freshers</option>
                <option value="1-3 Yr Exp">1-3 Yr Exp</option>
                <option value="3-5 Yr Exp">3-5 Yr Exp</option>
                <option value="5-10 Yr Exp">5-10 Yr Exp</option>
                <option value="10+ Yr Exp">10+ Yr Exp</option>
                <option value="Working">Working</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Finance Domain</label>
              <select
                value={formData.financeDomain}
                onChange={(e) => handleChange("financeDomain", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Domain</option>
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
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Counsellor</label>
              <select
                value={formData.counsellor}
                onChange={(e) => handleChange("counsellor", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Counsellor</option>
                {counsellors.map((counsellor) => (
                  <option key={counsellor.id} value={counsellor.name}>
                    {counsellor.name}
                  </option>
                ))}
              </select>
            </div>
            {formData.status === "Planning to visit FINXL office" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Visiting Date</label>
                <input
                  type="date"
                  value={formData.visitingDate}
                  onChange={(e) => handleChange("visitingDate", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            {formData.status === "Visit Done" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Visit Done Date</label>
                  <input
                    type="date"
                    value={formData.visitDoneDate}
                    onChange={(e) => handleChange("visitDoneDate", e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Counsellor Who Took Visit</label>
                  <select
                    value={formData.counsellorWhoTookVisit}
                    onChange={(e) => handleChange("counsellorWhoTookVisit", e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Called On</label>
              <input
                type="date"
                value={formData.calledOn}
                onChange={(e) => handleChange("calledOn", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Details</label>
              <textarea
                rows={3}
                value={formData.details}
                onChange={(e) => handleChange("details", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Follow Up Details</label>
              <textarea
                rows={3}
                value={formData.followUpDetails}
                onChange={(e) => handleChange("followUpDetails", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LeadsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, ensureAuth } = useAuth()
  const [leadsData, setLeadsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Action modals state
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Local search state for immediate UI updates
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "")

  // Get current params
  const currentPage = Number(searchParams.get("page")) || 1
  const currentLimit = Number(searchParams.get("limit")) || 10
  const currentSearch = searchParams.get("search") || ""
  const currentStatus = (searchParams.get("status") as LeadStatus | "all") || "all"
  const currentSortBy = (searchParams.get("sortBy") as "name" | "email" | "createdAt") || "createdAt"
  const currentSortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc"

  // Debounce the search input
  const debouncedSearchInput = useDebounce(searchInput, 500)

  const updateSearchParams = useCallback(
    (updates: Record<string, string | number>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === "all" || (key === "page" && value === 1)) {
          params.delete(key)
        } else {
          params.set(key, value.toString())
        }
      })

      router.push(`/leads?${params.toString()}`)
    },
    [searchParams, router],
  )

  const fetchLeads = useCallback(
    async (isSearching = false) => {
      try {
        if (isSearching) {
          setSearching(true)
        } else {
          setLoading(true)
        }
        setError(null)

        const response = await apiClient.getLeads({
          page: currentPage,
          limit: currentLimit,
          search: currentSearch,
          status: currentStatus,
          sortBy: currentSortBy,
          sortOrder: currentSortOrder,
        })

        if (response.success && response.data) {
          setLeadsData(response.data)
        } else {
          setError(response.error || "Failed to fetch leads")
        }
      } catch (err) {
        setError("Failed to fetch leads")
        console.error("Error fetching leads:", err)
      } finally {
        setLoading(false)
        setSearching(false)
      }
    },
    [currentPage, currentLimit, currentSearch, currentStatus, currentSortBy, currentSortOrder],
  )

  // Effect for debounced search
  useEffect(() => {
    if (debouncedSearchInput !== currentSearch) {
      updateSearchParams({ search: debouncedSearchInput, page: 1 })
    }
  }, [debouncedSearchInput, currentSearch, updateSearchParams])

  //const { ensureAuth } = useAuth()

  // Effect for fetching leads (ensure auth first)
  useEffect(() => {
    ensureAuth()
    const isSearching = searchInput !== currentSearch
    fetchLeads(isSearching)
  }, [currentPage, currentLimit, currentSearch, currentStatus, currentSortBy, currentSortOrder, fetchLeads])

  // Sync search input with URL params when navigating
  useEffect(() => {
    setSearchInput(currentSearch)
  }, [currentSearch])

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case "Follow Up":
        return "bg-blue-100 text-blue-800"
      case "Visit Done":
        return "bg-yellow-100 text-yellow-800"
      case "Admission Done":
        return "bg-purple-100 text-purple-800"
      case "Interested Details Shared Follow up call back":
        return "bg-green-100 text-green-800"
      case "Planning to visit FINXL office":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value)
  }

  const handleStatusFilter = (status: LeadStatus | "all") => {
    updateSearchParams({ status, page: 1 })
  }

  const handleLimitChange = (limit: number) => {
    updateSearchParams({ limit, page: 1 })
  }

  const handleSort = (sortBy: "name" | "email" | "createdAt") => {
    const newSortOrder = currentSortBy === sortBy && currentSortOrder === "asc" ? "desc" : "asc"
    updateSearchParams({ sortBy, sortOrder: newSortOrder })
  }

  const handlePageChange = (page: number) => {
    updateSearchParams({ page })
  }

  const handleViewLead = async (id: string) => {
    try {
      setActionLoading(true)
      const response = await apiClient.getLeadById(id)
      if (response.success && response.data) {
        setSelectedLead(response.data)
        setViewModalOpen(true)
      } else {
        setError(response.error || "Failed to fetch lead details")
      }
    } catch (err) {
      setError("Failed to fetch lead details")
      console.error("Error fetching lead:", err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditLead = async (id: string) => {
    try {
      setActionLoading(true)
      const response = await apiClient.getLeadById(id)
      if (response.success && response.data) {
        setSelectedLead(response.data)
        setEditModalOpen(true)
      } else {
        setError(response.error || "Failed to fetch lead details")
      }
    } catch (err) {
      setError("Failed to fetch lead details")
      console.error("Error fetching lead:", err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteLead = (id: string, name: string) => {
    setSelectedLead({ _id: id, name })
    setDeleteModalOpen(true)
  }

  const confirmDeleteLead = async () => {
    if (!selectedLead) return
    try {
      setActionLoading(true)
      const response = await apiClient.deleteLead(selectedLead._id)
      if (response.success) {
        // Refresh the leads list
        fetchLeads()
        setDeleteModalOpen(false)
        setSelectedLead(null)
      } else {
        setError(response.error || "Failed to delete lead")
        setDeleteModalOpen(false)
      }
    } catch (err: any) {
      if (err.message?.includes("Forbidden") || err.message?.includes("403")) {
        setError("You don't have permission to delete leads. Only administrators can delete leads.")
      } else {
        setError("Failed to delete lead")
      }
      console.error("Error deleting lead:", err)
      setDeleteModalOpen(false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateLead = async (updatedLead: any) => {
    if (!selectedLead) return
    try {
      setActionLoading(true)
      const response = await apiClient.updateLead(selectedLead.id, updatedLead)
      if (response.success) {
        // Refresh the leads list
        fetchLeads()
        setEditModalOpen(false)
        setSelectedLead(null)
      } else {
        setError(response.error || "Failed to update lead")
      }
    } catch (err) {
      setError("Failed to update lead")
      console.error("Error updating lead:", err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading && !leadsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !leadsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => fetchLeads()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Management</h1>
            <p className="text-gray-600">Manage and track all your leads in one place</p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/leads/bulk-upload">
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Bulk Upload
              </button>
            </Link>
            <Link href="/leads/new">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Add New Lead
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Summary */}
        {/* {leadsData && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {["Follow Up", "Visit Done", "Admission Done", "Interested Details Shared Follow up call back", "Planning to visit FINXL office"].map((status) => {
              const count = leadsData.leads.filter((lead) => lead.status === status).length
              return (
                <div key={status} className="bg-white shadow-md rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{status}</div>
                </div>
              )
            })}
          </div>
        )} */}

        {/* Filters and Search */}
        <div className="bg-white shadow-lg rounded-lg mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters & Search
              {searching && <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <svg
                  className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchInput}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searching && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              <select
                value={currentStatus}
                onChange={(e) => handleStatusFilter(e.target.value as LeadStatus | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
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

              <select
                value={currentLimit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>

              {/* <div className="flex gap-2">
                <button
                  onClick={() => handleSort("name")}
                  className={`flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1 ${currentSortBy === "name" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                    }`}
                >
                  Name
                  {currentSortBy === "name" && (
                    <svg
                      className={`h-4 w-4 ${currentSortOrder === "asc" ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleSort("createdAt")}
                  className={`flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1 ${currentSortBy === "createdAt" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                    }`}
                >
                  Date
                  {currentSortBy === "createdAt" && (
                    <svg
                      className={`h-4 w-4 ${currentSortOrder === "asc" ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </div> */}
            </div>
          </div>
        </div>


        {/* Leads List */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {leadsData ? `${leadsData.leads.length} of ${leadsData.total}` : "0 of 0"} Leads
                {searching && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
              </h2>
              {leadsData && leadsData.totalPages > 1 && (
                <div className="text-sm text-gray-600">
                  Page {leadsData.page} of {leadsData.totalPages}
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            {!leadsData || leadsData.leads.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                <p className="text-gray-600 mb-4">
                  {currentSearch || currentStatus !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by adding your first lead"}
                </p>
                <Link href="/leads/new">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    Add Your First Lead
                  </button>
                </Link>
              </div>
            ) : (
              <table className={`min-w-full divide-y divide-gray-200 ${searching ? "opacity-75" : ""}`}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Work Exp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Finance Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Follow Up Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Counsellor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visiting Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visit Done Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visit Counsellor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Called On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leadsData.leads.map((lead:any) => (
                    <tr key={lead._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lead.name}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.email}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.phone || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.city || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.workExp || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.financeDomain || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={lead.details || ""}>
                        {lead.details || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={lead.followUpDetails || ""}>
                        {lead.followUpDetails || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.counsellor || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.status === "Planning to visit FINXL office" ? (lead.visitingDate ? new Date(lead.visitingDate).toLocaleDateString() : "-") : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.status === "Visit Done" ? (lead.visitDoneDate ? new Date(lead.visitDoneDate).toLocaleDateString() : "-") : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.status === "Visit Done" ? (lead.counsellorWhoTookVisit || "-") : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.calledOn ? new Date(lead.calledOn).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewLead(lead._id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="View Lead"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditLead(lead._id)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                            title="Edit Lead"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDeleteLead(lead._id, lead.name)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Delete Lead"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Pagination */}
          {leadsData && leadsData.totalPages > 1 && (
            <div className="bg-white px-6 py-3 border-t border-gray-200 flex justify-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: leadsData.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border rounded-lg ${page === currentPage
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= leadsData.totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Lead Modal */}
      {viewModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Lead Details</h3>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.phone || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.city || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Work Experience</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.workExp || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Finance Domain</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.financeDomain || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(selectedLead.status)}`}>
                    {selectedLead.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Counsellor</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.counsellor || "-"}</p>
                </div>
                {selectedLead.status === "Planning to visit FINXL office" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Visiting Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedLead.visitingDate ? new Date(selectedLead.visitingDate).toLocaleDateString() : "-"}
                    </p>
                  </div>
                )}
                {selectedLead.status === "Visit Done" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Visit Done Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedLead.visitDoneDate ? new Date(selectedLead.visitDoneDate).toLocaleDateString() : "-"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Counsellor Who Took Visit</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLead.counsellorWhoTookVisit || "-"}</p>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Called On</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedLead.calledOn ? new Date(selectedLead.calledOn).toLocaleDateString() : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedLead.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Details</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.details || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Follow Up Details</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.followUpDetails || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {editModalOpen && selectedLead && (
        <EditLeadModal
          lead={selectedLead}
          onClose={() => setEditModalOpen(false)}
          onSave={handleUpdateLead}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Delete Lead</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete <strong>{selectedLead.name}</strong>? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteLead}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
