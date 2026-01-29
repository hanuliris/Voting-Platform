'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/protected-route'
import { ledgerApi } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ArrowLeft, Link as LinkIcon, ListChecks, Loader2, RefreshCw, ShieldCheck } from 'lucide-react'

const verifyLedger = (entries) => {
  if (!entries?.length) {
    return { isValid: true, total: 0, issues: [], ordered: [] }
  }

  const ordered = [...entries].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  const issues = []

  for (let i = 1; i < ordered.length; i++) {
    const previous = ordered[i - 1]
    const current = ordered[i]

    if (!current.previousHash || current.previousHash !== previous.hash) {
      issues.push({
        id: current.id,
        index: i,
        expected: previous.hash,
        actual: current.previousHash,
      })
    }
  }

  return {
    isValid: issues.length === 0,
    total: ordered.length,
    issues,
    ordered,
  }
}

const truncateHash = (value) => {
  if (!value) return '—'
  if (value.length <= 20) return value
  return `${value.slice(0, 12)}…${value.slice(-6)}`
}

export default function LedgerProofPage() {
  const router = useRouter()
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchLedger = useCallback(async (showSpinner = true) => {
    if (showSpinner) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError('')

    try {
      const data = await ledgerApi.getEntries()
      setEntries(data)
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to load ledger entries right now.'
      setError(message)
    } finally {
      if (showSpinner) {
        setIsLoading(false)
      } else {
        setIsRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchLedger(true)
  }, [fetchLedger])

  const verification = useMemo(() => verifyLedger(entries), [entries])
  const latestEntry = entries[0] || null
  const invalidEntryIds = useMemo(() => new Set(verification.issues.map((issue) => issue.id)), [verification.issues])

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-primary" />
                Blockchain Ledger Proof
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Every poll lifecycle and vote event is chained via SHA-256 hashes. Use this page to demonstrate that
                nothing can be silently altered without breaking the chain.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => router.push('/admin')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
              </Button>
              <Button onClick={() => fetchLedger(false)} disabled={isRefreshing}>
                {isRefreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                {isRefreshing ? 'Refreshing…' : 'Refresh Ledger'}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Chain Health Snapshot
              </CardTitle>
              <CardDescription>Live verification based on the hashes issued by the backend ledger service.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <p className="text-destructive text-sm">{error}</p>}
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Integrity Status</p>
                  <Badge
                    variant={verification.isValid ? 'default' : 'destructive'}
                    className={verification.isValid ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}
                  >
                    {verification.isValid ? 'Chain Verified' : 'Attention Required'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blocks Audited</p>
                  <p className="text-2xl font-semibold">{verification.total}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Latest Block Hash</p>
                  <p className="font-mono text-xs break-all bg-muted/50 px-3 py-2 rounded-md">
                    {latestEntry ? latestEntry.hash : 'No ledger entries yet'}
                  </p>
                </div>
              </div>

              {latestEntry && (
                <div className="grid gap-4 md:grid-cols-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Latest Entity</span>
                    <p className="font-medium">
                      {latestEntry.entityType} #{latestEntry.entityId}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Action</span>
                    <p className="font-medium">{latestEntry.action}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recorded At</span>
                    <p className="font-medium">{formatDateTime(latestEntry.createdAt)}</p>
                  </div>
                </div>
              )}

              {!verification.isValid && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive space-y-2">
                  <p className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Chain break detected
                  </p>
                  {verification.issues.map((issue) => (
                    <p key={issue.id}>
                      Block #{issue.id} expected previous hash {truncateHash(issue.expected)} but found {truncateHash(issue.actual || 'null')}.
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ledger Entries</CardTitle>
              <CardDescription>Newest entries are shown first. Chain validation runs chronologically.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : entries.length ? (
                <div className="overflow-x-auto rounded-md border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Block #</th>
                        <th className="px-4 py-2 text-left">Timestamp</th>
                        <th className="px-4 py-2 text-left">Scope</th>
                        <th className="px-4 py-2 text-left">Action</th>
                        <th className="px-4 py-2 text-left">Hash</th>
                        <th className="px-4 py-2 text-left">Previous Hash</th>
                        <th className="px-4 py-2 text-left">Metadata</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => {
                        const isBroken = invalidEntryIds.has(entry.id)
                        return (
                          <tr key={entry.id} className={`border-t ${isBroken ? 'bg-destructive/5' : ''}`}>
                            <td className="px-4 py-2 font-mono text-xs">{entry.id}</td>
                            <td className="px-4 py-2">{formatDateTime(entry.createdAt)}</td>
                            <td className="px-4 py-2">
                              <Badge variant="secondary" className="mb-1">
                                {entry.entityType}
                              </Badge>
                              <div className="text-xs text-muted-foreground">ID {entry.entityId}</div>
                            </td>
                            <td className="px-4 py-2">{entry.action}</td>
                            <td className="px-4 py-2 font-mono text-xs break-all">{entry.hash}</td>
                            <td className="px-4 py-2 font-mono text-xs break-all">{entry.previousHash || '—'}</td>
                            <td className="px-4 py-2 text-xs text-muted-foreground">{entry.metadata || '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No ledger entries yet. Create a poll or cast a vote to generate the first block.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                How to Prove Integrity to Reviewers
              </CardTitle>
              <CardDescription>Use this lightweight script during audits or live demos.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground">
                <li>Perform an admin action (e.g., create a poll or cast a test vote), then click <strong>Refresh Ledger</strong> to append the new block.</li>
                <li>Highlight the <strong>Latest Block Hash</strong> and explain that any tampering changes this value and the corresponding <em>Previous Hash</em> on the next block.</li>
                <li>Scroll through the table to show that each block references the hash from the previous block. Any mismatch would surface immediately in the integrity alert area above.</li>
                <li>Optionally export the table (browser print or copy) so external reviewers can independently recompute SHA-256 hashes using the listed metadata.</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
