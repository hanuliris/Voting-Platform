'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/protected-route'
import { ResultsChart } from '@/components/results-chart'
import { pollApi, voteApi } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function ResultsPage() {
  const router = useRouter()
  const [polls, setPolls] = useState([])
  const [selectedPoll, setSelectedPoll] = useState(null)
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPolls()
  }, [])

  const loadPolls = async () => {
    try {
      setIsLoading(true)
      const data = await pollApi.getAllPolls()
      setPolls(data)
    } catch (error) {
      console.error('Error loading polls:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadResults = async (pollId) => {
    try {
      const poll = polls.find((p) => p.id === pollId)
      setSelectedPoll(poll)
      
      const resultsData = await voteApi.getPollResults(pollId)
      setResults(resultsData)
    } catch (error) {
      console.error('Error loading results:', error)
    }
  }

  return (
    <ProtectedRoute requiredRole="VOTER">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button variant="outline" onClick={() => router.push('/vote')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Voting
            </Button>
          </div>

          <h1 className="text-3xl font-bold mb-8">Poll Results</h1>

          {!selectedPoll ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Select a Poll</h2>
              {isLoading ? (
                <Card>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {polls.map((poll) => (
                    <Card
                      key={poll.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => loadResults(poll.id)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{poll.title}</CardTitle>
                            <CardDescription>{poll.description}</CardDescription>
                          </div>
                          <Badge variant={poll.status === 'ACTIVE' ? 'default' : 'outline'}>
                            {poll.status}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <Button variant="outline" onClick={() => setSelectedPoll(null)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Poll List
              </Button>
              <ResultsChart results={results} pollTitle={selectedPoll.title} />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
