'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { pollApi, candidateApi, voteApi } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { ArrowLeft, RefreshCw, Trash2, Users, BarChart3, PlusCircle } from 'lucide-react'
import { ResultsChart } from '@/components/results-chart'

export default function PollDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const pollId = params?.pollId

  const [poll, setPoll] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmittingCandidate, setIsSubmittingCandidate] = useState(false)
  const [candidateForm, setCandidateForm] = useState({ name: '', description: '' })
  const [error, setError] = useState(null)

  useEffect(() => {
    if (pollId) {
      loadPoll()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollId])

  const loadPoll = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [pollData, candidateData] = await Promise.all([
        pollApi.getPollById(pollId),
        candidateApi.getCandidatesByPollId(pollId),
      ])
      setPoll(pollData)
      setCandidates(candidateData)

      try {
        const resultData = await voteApi.getPollResults(pollId)
        setResults(resultData)
      } catch (resultsError) {
        // Results endpoint may fail if no votes yet; treat as informational
        setResults(null)
      }
    } catch (err) {
      console.error('Error loading poll:', err)
      setError('Unable to load poll details right now. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePoll = async () => {
    if (!window.confirm('Delete this poll permanently? This action cannot be undone.')) {
      return
    }
    try {
      setIsDeleting(true)
      await pollApi.deletePoll(pollId)
      router.push('/admin')
    } catch (err) {
      console.error('Error deleting poll:', err)
      setError('Failed to delete poll. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCandidateSubmit = async (event) => {
    event.preventDefault()
    if (!candidateForm.name.trim()) {
      setError('Candidate name is required')
      return
    }
    try {
      setIsSubmittingCandidate(true)
      setError(null)
      await candidateApi.addCandidate(pollId, candidateForm)
      setCandidateForm({ name: '', description: '' })
      await loadPoll()
    } catch (err) {
      console.error('Error adding candidate:', err)
      setError('Unable to add candidate. Please try again.')
    } finally {
      setIsSubmittingCandidate(false)
    }
  }

  const refreshResults = async () => {
    try {
      setIsLoading(true)
      const resultData = await voteApi.getPollResults(pollId)
      setResults(resultData)
    } catch (err) {
      console.error('Error loading results:', err)
      setResults(null)
    } finally {
      setIsLoading(false)
    }
  }

  const renderCandidates = () => {
    if (!candidates.length) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>No Candidates Yet</CardTitle>
            <CardDescription>Add at least one candidate to open voting.</CardDescription>
          </CardHeader>
        </Card>
      )
    }

    return (
      <div className="grid gap-4">
        {candidates.map((candidate) => (
          <Card key={candidate.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{candidate.name}</CardTitle>
                  <CardDescription>{candidate.description || 'No description provided.'}</CardDescription>
                </div>
                <Badge variant="secondary">Candidate</Badge>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDeletePoll} disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete Poll
              </Button>
            </div>
          </div>

          {error && (
            <Card>
              <CardContent className="text-destructive font-medium">{error}</CardContent>
            </Card>
          )}

          {isLoading && (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && poll && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-3xl flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        {poll.title}
                      </CardTitle>
                      <CardDescription>{poll.description}</CardDescription>
                    </div>
                    <Badge variant={poll.status === 'ACTIVE' ? 'default' : 'outline'}>{poll.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-semibold">Start:</span> {formatDateTime(poll.startDate)}
                  </div>
                  <div>
                    <span className="font-semibold">End:</span> {formatDateTime(poll.endDate)}
                  </div>
                  <div>
                    <span className="font-semibold">Created By:</span> {poll.createdBy?.name || 'Administrator'}
                  </div>
                  <div>
                    <span className="font-semibold">Poll ID:</span> {poll.id}
                  </div>
                </CardContent>
              </Card>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" /> Candidates
                  </h2>
                </div>
                {renderCandidates()}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PlusCircle className="h-5 w-5" /> Add Candidate
                    </CardTitle>
                    <CardDescription>Quickly add a new candidate to this poll.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={handleCandidateSubmit}>
                      <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <Input
                          value={candidateForm.name}
                          placeholder="Candidate name"
                          onChange={(e) => setCandidateForm((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Short Bio</label>
                        <textarea
                          className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={candidateForm.description}
                          placeholder="Why should voters pick this candidate?"
                          onChange={(e) => setCandidateForm((prev) => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <Button type="submit" disabled={isSubmittingCandidate}>
                        <PlusCircle className="h-4 w-4 mr-2" /> Add Candidate
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" /> Live Results
                  </h2>
                  <Button variant="outline" onClick={refreshResults}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                  </Button>
                </div>
                {results ? (
                  <ResultsChart results={results} pollTitle={poll.title} />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Votes Yet</CardTitle>
                      <CardDescription>Results will appear as soon as voters participate.</CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
