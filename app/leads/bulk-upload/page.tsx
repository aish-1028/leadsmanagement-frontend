"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { apiClient, User } from "@/lib/api"
import { useAuth } from "@/lib/auth"

export default function BulkUploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedCounsellor, setSelectedCounsellor] = useState<string>("")
  const [counsellors, setCounsellors] = useState<User[]>([])

  const { ensureAuth } = useAuth()

  useEffect(() => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ]
      if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls)$/)) {
        setError("Please select a valid Excel file (.xlsx or .xls)")
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    if (!selectedCounsellor) {
      setError("Please select a counsellor")
      return
    }

    setUploading(true)
    setError(null)
    setResult(null)

    try {
      await ensureAuth()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('counsellor', selectedCounsellor)

      const response = await apiClient.bulkInsertLeads(formData)

      if (response.success) {
        setResult(response.data)
      } else {
        setError(response.error || "Upload failed")
      }
    } catch (err) {
      setError("Upload failed. Please try again.")
      console.error("Bulk upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    // Create a sample Excel template
    const headers = [
      'name', 'email', 'phone', 'city', 'workExp', 'financeDomain',
      'status', 'details', 'followUpDetails', 'counsellor', 'calledOn',
      'visitingDate', 'visitDoneDate', 'counsellorWhoTookVisit'
    ]

    const sampleData = [
      headers,
      [
        'John Doe',
        'john@example.com',
        '+1234567890',
        'Mumbai',
        '1-3 Yr Exp',
        'Financial Analyst',
        'Just Casual Enquiry',
        'Interested in finance courses',
        'Call back next week',
        'Sarah Johnson',
        '2024-01-15',
        '', // visitingDate - empty for sample
        '', // visitDoneDate - empty for sample
        ''  // counsellorWhoTookVisit - empty for sample
      ]
    ]

    // For now, just show an alert. In a real app, you'd generate and download the Excel file
    alert("Template download feature would generate an Excel file with proper headers and sample data.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/leads">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Leads
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Leads</h1>
            <p className="text-gray-600">Upload multiple leads from an Excel file</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="max-w-2xl mx-auto">
            {/* Instructions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-2">
                  <li>Download the Excel template to see the required format</li>
                  <li>Required columns: <strong>name</strong>, <strong>phone</strong></li>
                  <li>Optional columns: email, city, workExp, financeDomain, status, details, followUpDetails, counsellor, calledOn</li>
                  <li>Use valid values for workExp, financeDomain, and status (see template)</li>
                  <li>calledOn should be in YYYY-MM-DD format</li>
                  <li>Duplicate phones will be skipped</li>
                </ul>
              </div>
              <button
                onClick={downloadTemplate}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Excel Template
              </button>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Excel File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">Excel files (.xlsx, .xls) up to 10MB</p>
                </div>
              </div>
              {file && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    Selected: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>

            {/* Counsellor Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Counsellor
              </label>
              <select
                value={selectedCounsellor}
                onChange={(e) => setSelectedCounsellor(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Counsellor</option>
                {counsellors.map((counsellor) => (
                  <option key={counsellor.id} value={counsellor.name}>
                    {counsellor.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">All leads from the uploaded file will be assigned to this counsellor</p>
            </div>

            {/* Upload Button */}
            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Leads
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Upload Successful!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p><strong>Inserted:</strong> {result.inserted} leads</p>
                      <p><strong>Skipped:</strong> {result.skipped} leads (duplicates)</p>
                      <p><strong>Errors:</strong> {result.errors} rows had validation errors</p>
                      {result.errorDetails && result.errorDetails.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Error Details:</p>
                          <ul className="list-disc list-inside mt-1">
                            {result.errorDetails.slice(0, 5).map((error: string, index: number) => (
                              <li key={index}>{error}</li>
                            ))}
                            {result.errorDetails.length > 5 && (
                              <li>... and {result.errorDetails.length - 5} more errors</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <Link href="/leads">
                        <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                          View All Leads
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}