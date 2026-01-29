'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Calendar, Clock, Users, CheckCircle, AlertCircle, Vote } from 'lucide-react'
import { candidateApi, voteApi } from '@/lib/api'
import { useAuth } from '@/components/auth-provider'
import { formatDateTime } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export function VotingCard({ poll, onVoteSuccess }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [candidates, setCandidates] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasVoted, setHasVoted] = useState(false)
  const [showCandidates, setShowCandidates] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const candidatesData = await candidateApi.getCandidatesByPollId(poll.id)
        setCandidates(candidatesData)

        if (user) {
          const votedData = await voteApi.hasUserVoted(poll.id)
          setHasVoted(votedData.hasVoted)
        }
      } catch (error) {
        console.error('Error loading poll data:', error)
      }
    }

    loadData()
  }, [poll.id, user])

  const isActive = poll.status === 'ACTIVE' && 
    new Date() >= new Date(poll.startDate) && 
    new Date() <= new Date(poll.endDate)
  const isPending = new Date() < new Date(poll.startDate)
  const isEnded = new Date() > new Date(poll.endDate)

  const handleVote = async () => {
    if (!selectedCandidate || !user) return

    setIsLoading(true)
    setError('')

    try {
      await voteApi.castVote({
        pollId: poll.id,
        candidateId: selectedCandidate,
      })

      setHasVoted(true)
      toast({
        title: 'Vote Cast Successfully',
        description: 'Your vote has been recorded.',
      })
      
      if (onVoteSuccess) {
        onVoteSuccess()
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to cast vote. Please try again.'
      setError(errorMsg)
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (hasVoted)
      return (
        <Badge variant="default" className="bg-green-600">
          Voted
        </Badge>
      )
    if (isActive) return <Badge variant="default">Active</Badge>
    if (isPending) return <Badge variant="secondary">Pending</Badge>
    if (isEnded) return <Badge variant="outline">Ended</Badge>
    return <Badge variant="outline">Inactive</Badge>
  }

  const getStatusIcon = () => {
    if (hasVoted) return <CheckCircle className="h-5 w-5 text-green-600" />
    if (isActive) return <Vote className="h-5 w-5 text-primary" />
    return <AlertCircle className="h-5 w-5 text-muted-foreground" />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {getStatusIcon()}
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{poll.title}</CardTitle>
              <CardDescription className="text-base">{poll.description}</CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Start: {formatDateTime(poll.startDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>End: {formatDateTime(poll.endDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{candidates.length} Candidates</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasVoted ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You have already voted in this poll. Thank you for participating!
            </AlertDescription>
          </Alert>
        ) : isActive ? (
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCandidates(!showCandidates)}
            >
              {showCandidates ? 'Hide Candidates' : 'Show Candidates & Vote'}
            </Button>

            {showCandidates && (
              <div className="space-y-4 border rounded-lg p-4">
                <h4 className="font-semibold">Select Your Candidate</h4>
                <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-accent">
                      <RadioGroupItem value={candidate.id.toString()} id={`candidate-${candidate.id}`} />
                      <Label htmlFor={`candidate-${candidate.id}`} className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          {candidate.description && (
                            <p className="text-sm text-muted-foreground">{candidate.description}</p>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <Button
                  onClick={handleVote}
                  disabled={!selectedCandidate || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Casting Vote...' : 'Cast Vote'}
                </Button>
              </div>
            )}
          </div>
        ) : isPending ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>This poll has not started yet.</AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>This poll has ended.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
