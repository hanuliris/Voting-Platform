'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProtectedRoute } from '@/components/protected-route'
import { voteApi } from '@/lib/api'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function VoteHistoryPage() {
  const router = useRouter()
  const [voteHistory, setVoteHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadVoteHistory()
  }, [])

  const loadVoteHistory = async () => {
    try {
      setIsLoading(true)
      const data = await voteApi.getVoteHistory()
      setVoteHistory(data)
    } catch (error) {
      console.error('Error loading vote history:', error)
    } finally {
      setIsLoading(false)
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

          <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <CheckCircle className="h-8 w-8 text-primary" />
            Your Vote History
          </h1>

          {isLoading ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          ) : voteHistory.length > 0 ? (
            <div className="grid gap-4">
              {voteHistory.map((vote) => (
                <Card key={vote.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle>{vote.pollTitle}</CardTitle>
                        <CardDescription>{vote.pollDescription}</CardDescription>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Voted
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 text-sm">
                      <div>
                        <span className="font-medium">Candidate:</span> {vote.candidateName}
                      </div>
                      <div>
                        <span className="font-medium">Vote Cast:</span> {formatDateTime(vote.votedAt)}
                      </div>
                      <div>
                        <span className="font-medium">Vote ID:</span> {vote.id}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Vote History</CardTitle>
                <CardDescription>
                  You haven&apos;t cast any votes yet. Visit the voting page to participate in active polls.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/vote')}>Go to Voting</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
