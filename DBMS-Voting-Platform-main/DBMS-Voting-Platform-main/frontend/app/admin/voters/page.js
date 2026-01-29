'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { adminApi } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { Upload, Search, Loader2, FileSpreadsheet, ArrowLeft } from 'lucide-react'

export default function VoterManagementPage() {
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [importResults, setImportResults] = useState([])
  const [importError, setImportError] = useState('')

  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searchError, setSearchError] = useState('')

  const handleUpload = async () => {
    if (!file) {
      setImportError('Please choose an Excel file (.xlsx) with a Name column')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setIsUploading(true)
    setImportError('')
    try {
      const data = await adminApi.importVoters(formData)
      setImportResults(data)
      setFile(null)
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to import voters'
      setImportError(message)
      setImportResults([])
    } finally {
      setIsUploading(false)
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) {
      setSearchResults([])
      setSearchError('')
      return
    }

    setIsSearching(true)
    setSearchError('')
    try {
      const results = await adminApi.searchVoters(query.trim())
      setSearchResults(results)
    } catch (error) {
      setSearchError('Failed to search for voters')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const renderImportTable = () => {
    if (!importResults.length) {
      return null
    }

    return (
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Temporary Password</th>
              <th className="px-4 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {importResults.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2 font-mono text-sm">{row.email}</td>
                <td className="px-4 py-2 font-mono text-sm">{row.temporaryPassword}</td>
                <td className="px-4 py-2">{formatDateTime(row.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderSearchTable = () => {
    if (!searchResults.length) {
      return null
    }

    return (
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Added</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2 font-mono text-sm">{row.email}</td>
                <td className="px-4 py-2">{formatDateTime(row.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              Eligible Voter Management
            </h1>
            <Button variant="outline" onClick={() => router.push('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" /> Upload Excel Roster
              </CardTitle>
              <CardDescription>
                Provide a .xlsx file with a single column named <strong>Name</strong>. Temporary emails are generated automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {importError && <p className="text-destructive text-sm">{importError}</p>}
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null)
                  setImportError('')
                }}
              />
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                {isUploading ? 'Processing…' : 'Import Voters'}
              </Button>
              {renderImportTable()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" /> Voter Directory Lookup
              </CardTitle>
              <CardDescription>Confirm whether a specific voter already exists.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {searchError && <p className="text-destructive text-sm">{searchError}</p>}
              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  placeholder="Search by name or email"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  {isSearching ? 'Searching…' : 'Search'}
                </Button>
              </div>
              {renderSearchTable()}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
