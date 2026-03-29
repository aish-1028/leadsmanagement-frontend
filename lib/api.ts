const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

import { getToken } from "./auth"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface LeadResponse {
  leads: Lead[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface Lead {
  _id: string
  name: string
  email: string
  status: LeadStatus
  phone?: string
  city?: string
  workExp?: string
  financeDomain?: string[]
  leadStage?: string
  details?: string
  followUpDetails?: string
  counsellor?: string
  visitingDate?: string
  visitDoneDate?: string
  counsellorWhoTookVisit?: string
  calledOn?: string
  createdAt: string
  updatedAt: string
}

export type LeadStatus = | "Just Casual Enquiry"
    | "Not receiving"
    | "Lead Forward"
    | "Not Interested"
    | "Interested but Fees Budget Issue"
    | "Planning to visit FINXL office"
    | "Want Offline Class Other than Pune City"
    | "Visit Done"
    | "Payment Details Shared for Admission"
    | "Admission Done"
    | "Joined Another Institute"
    | "Online Live"
    | "Interested Details Shared Follow up call back"
    | "Not Eligible"
    | "Follow Up"

export interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface LeadQuery {
  page?: number
  limit?: number
  search?: string
  status?: LeadStatus | "all"
  counsellor?: string | "all"
  sortBy?: "name" | "email" | "createdAt"
  sortOrder?: "asc" | "desc"
  allUsers?: boolean
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`


    // Attach auth token if present in cookies
    const token = getToken()

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    // Don't set Content-Type for FormData, let the browser set it
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json"
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const config: RequestInit = {
      method: options.method || "GET",
      headers,
      ...options,
    }

    try {
      const response = await fetch(url, config)

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("❌ Fetch Error Details:")
      // Type guard to check if error is an instance of Error
      if (error instanceof Error) {
        console.error("- Error Type:", error)

        // Re-throw with more context
        throw new Error(`API Request Failed: ${error.message}`)
      } else {
        // Handle non-Error cases (e.g., string, number, etc.)
        console.error("- Error Type: Unknown")
        throw new Error(`API Request Failed: Unknown error`)
      }
    }
  }

  async getLeads(query: LeadQuery = {}): Promise<ApiResponse<LeadResponse>> {
    const searchParams = new URLSearchParams()

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/leads${queryString ? `?${queryString}` : ""}`

    return this.request<LeadResponse>(endpoint)
  }

  async createLead(lead: Omit<Lead, "_id" | "createdAt" | "updatedAt"> & Record<string, any>): Promise<ApiResponse<Lead>> {
    return this.request<Lead>("/leads", {
      method: "POST",
      body: JSON.stringify(lead),
    })
  }

  async getLeadStats(): Promise<
    ApiResponse<{
      total: number
      statusCounts: Record<LeadStatus, number>
      conversionRate: number
    }>
  > {
    return this.request("/leads/stats")
  }

  async bulkInsertLeads(formData: FormData): Promise<ApiResponse<{
    inserted: number
    skipped: number
    errors: number
    skippedPhones: string[]
    errorDetails: string[]
  }>> {
    const token = getToken()

    const headers: Record<string, string> = {}
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    return this.request("/leads/bulk", {
      method: "POST",
      headers,
      body: formData,
    })
  }

  async getLeadById(id: string): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/leads/${id}`)
  }

  async updateLead(id: string, lead: Partial<Omit<Lead, "_id" | "createdAt" | "updatedAt">>): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(lead),
    })
  }

  async deleteLead(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/leads/${id}`, {
      method: "DELETE",
    })
  }

  // Auth endpoints
  async signup(payload: { name: string; email: string; password: string; role?: string }) {
    return this.request<any>(`/users/signup`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async login(payload: { email: string; password: string }) {
    return this.request<any>(`/users/login`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  // User management endpoints
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>("/users")
  }

  async createUser(user: { name: string; email: string; password: string; role: string }): Promise<ApiResponse<User>> {
    return this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify(user),
    })
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`)
  }

  async updateUser(id: string, user: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    })
  }

  async deleteUser(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: "DELETE",
    })
  }
}

export const apiClient = new ApiClient()
