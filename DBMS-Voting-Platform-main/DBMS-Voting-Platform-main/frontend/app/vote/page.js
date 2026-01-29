'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/protected-route'
import { VotingCard } from '@/components/voting-card'
import { useAuth } from '@/components/auth-provider'
import { pollApi } from '@/lib/api'
import { Vote, LogOut, History, BarChart3 } from 'lucide-react'

export default function VotePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [polls, setPolls] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const loadPolls = async () => {
    try {
      setIsLoading(true)
      const data = await pollApi.getActivePolls()
      setPolls(data)
    } catch (error) {
      console.error('Error loading polls:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPolls()
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <ProtectedRoute requiredRole="VOTER">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Vote className="h-8 w-8 text-primary" />
                Voting Dashboard
              </h1>
              <p className="text-muted-foreground">Welcome, {user?.name}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/vote/history')}>
                <History className="h-4 w-4 mr-2" />
                Vote History
              </Button>
              <Button variant="outline" onClick={() => router.push('/vote/results')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Results
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Active Polls */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Active Polls</h2>
              {isLoading ? (
                <Card>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : polls.length > 0 ? (
                <div className="grid gap-6">
                  {polls.map((poll) => (
                    <VotingCard key={poll.id} poll={poll} onVoteSuccess={loadPolls} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Active Polls</CardTitle>
                    <CardDescription>
                      There are currently no active polls. Check back later!
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
