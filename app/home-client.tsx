"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Breadcrumb from "@/components/breadcrumb"
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

export default function HomeClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { ensureAuth } = useAuth()
  const [stats, setStats] = useState<any>({
    total: 0,
    statusCounts: { "Follow Up": 0, "Visit Done": 0, "Admission Done": 0, "Interested Details Shared Follow up call back": 0, "Planning to visit FINXL office": 0 },
    conversionRate: 0,
  })
  const [leadsData, setLeadsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [counsellors, setCounsellors] = useState<any[]>([])

  // Local search state for immediate UI updates
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "")

  // Get current params
  const currentPage = Number(searchParams.get("page")) || 1
  const currentLimit = Number(searchParams.get("limit")) || 25
  const currentSearch = searchParams.get("search") || ""
  const currentStatus = (searchParams.get("status") as LeadStatus | "all") || "all"
  const currentCounsellor = searchParams.get("counsellor") || "all"
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

      router.push(`/?${params.toString()}`)
    },
    [searchParams, router],
  )

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

  const fetchData = useCallback(
    async (isSearching = false) => {
      try {
        if (isSearching) {
          setSearching(true)
        } else {
          setLoading(true)
        }

        // Fetch stats
        const statsResponse = await apiClient.getLeadStats()
        if (statsResponse.success && statsResponse.data) setStats(statsResponse.data)

        // Fetch leads (all leads, not filtered by user)
        const leadsResponse = await apiClient.getLeads({
          page: currentPage,
          limit: currentLimit,
          search: currentSearch,
          status: currentStatus,
          counsellor: currentCounsellor,
          sortBy: currentSortBy,
          sortOrder: currentSortOrder,
          allUsers: true,
        })

        if (leadsResponse.success && leadsResponse.data) {
          setLeadsData(leadsResponse.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
        setSearching(false)
      }
    },
    [currentPage, currentLimit, currentSearch, currentStatus, currentCounsellor, currentSortBy, currentSortOrder],
  )

  // Effect for debounced search
  useEffect(() => {
    if (debouncedSearchInput !== currentSearch) {
      updateSearchParams({ search: debouncedSearchInput, page: 1 })
    }
  }, [debouncedSearchInput, currentSearch, updateSearchParams])

  // Effect for fetching data
  useEffect(() => {
    ensureAuth()
    fetchCounsellors()
    const isSearching = searchInput !== currentSearch
    fetchData(isSearching)
  }, [currentPage, currentLimit, currentSearch, currentStatus, currentCounsellor, currentSortBy, currentSortOrder, fetchData])

  // Sync search input with URL params when navigating
  useEffect(() => {
    setSearchInput(currentSearch)
  }, [currentSearch])

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value)
  }

  const handleStatusFilter = (value: LeadStatus | "all") => {
    updateSearchParams({ status: value, page: 1 })
  }

  const handleCounsellorFilter = (value: string) => {
    updateSearchParams({ counsellor: value, page: 1 })
  }

  const handleLimitChange = (value: number) => {
    updateSearchParams({ limit: value, page: 1 })
  }

  const handlePageChange = (page: number) => {
    updateSearchParams({ page })
  }

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case "Follow Up":
        return "bg-blue-100 text-blue-800"
      case "Visit Done":
        return "bg-green-100 text-green-800"
      case "Admission Done":
        return "bg-purple-100 text-purple-800"
      case "Planning to visit FINXL office":
        return "bg-yellow-100 text-yellow-800"
      case "Interested Details Shared Follow up call back":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <Breadcrumb />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Minimal content; reuse existing server page layout if needed */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to LeadFlow</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Your comprehensive lead tracking and management dashboard</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-sm font-medium text-gray-600">Total Leads</h3>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-sm font-medium text-gray-600">Follow Up</h3>
              <div className="text-2xl font-bold text-green-600">{stats.statusCounts["Follow Up"]}</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-sm font-medium text-gray-600">Visit Done</h3>
              <div className="text-2xl font-bold text-yellow-600">{stats.statusCounts["Visit Done"]}</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-sm font-medium text-gray-600">Conversion Rate</h3>
              <div className="text-2xl font-bold text-orange-600">{stats.conversionRate}%</div>
            </div>
          </div>

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
                  value={currentCounsellor}
                  onChange={(e) => handleCounsellorFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Counsellors</option>
                  {counsellors.map((counsellor) => (
                    <option key={counsellor.id} value={counsellor.name}>
                      {counsellor.name}
                    </option>
                  ))}
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
              </div>
            </div>
          </div>

          {/* Leads Table */}
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
                    {currentSearch || currentStatus !== "all" || currentCounsellor !== "all"
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        City
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
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
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leadsData.leads.map((lead: any) => (
                      <tr key={lead._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {lead.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.phone || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.city || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
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
                          {new Date(lead.createdAt).toLocaleDateString()}
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
      </div>
    </>
  )
}
