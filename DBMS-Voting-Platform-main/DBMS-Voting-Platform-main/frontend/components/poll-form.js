'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { pollApi, candidateApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Plus, X } from 'lucide-react'

export function PollForm({ onSuccess, onCancel, poll }) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: poll?.title || '',
    description: poll?.description || '',
    startDate: poll?.startDate || '',
    endDate: poll?.endDate || '',
  })
  const [candidates, setCandidates] = useState([
    { name: '', description: '' },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCandidateChange = (index, field, value) => {
    const newCandidates = [...candidates]
    newCandidates[index][field] = value
    setCandidates(newCandidates)
  }

  const addCandidate = () => {
    setCandidates([...candidates, { name: '', description: '' }])
  }

  const removeCandidate = (index) => {
    if (candidates.length > 1) {
      setCandidates(candidates.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date')
      return
    }

    if (candidates.some((c) => !c.name.trim())) {
      setError('All candidates must have a name')
      return
    }

    setIsLoading(true)

    try {
      // Create or update poll
      const pollData = {
        ...formData,
        status: 'PENDING',
      }

      console.log('Sending poll data:', pollData)

      let createdPoll
      if (poll) {
        createdPoll = await pollApi.updatePoll(poll.id, pollData)
      } else {
        createdPoll = await pollApi.createPoll(pollData)

        // Add candidates
        for (const candidate of candidates) {
          if (candidate.name.trim()) {
            await candidateApi.addCandidate(createdPoll.id, candidate)
          }
        }
      }

      toast({
        title: 'Success',
        description: poll ? 'Poll updated successfully' : 'Poll created successfully',
      })

      if (onSuccess) {
        onSuccess(createdPoll)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save poll'
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Poll Details</CardTitle>
          <CardDescription>Enter the basic information for the poll</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Poll Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter poll title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter poll description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date & Time</Label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time</Label>
              <Input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {!poll && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Candidates</CardTitle>
                <CardDescription>Add candidates for this poll</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addCandidate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {candidates.map((candidate, index) => (
              <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`candidate-name-${index}`}>Candidate Name</Label>
                    <Input
                      id={`candidate-name-${index}`}
                      value={candidate.name}
                      onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                      placeholder="Enter candidate name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`candidate-desc-${index}`}>Description (Optional)</Label>
                    <Input
                      id={`candidate-desc-${index}`}
                      value={candidate.description}
                      onChange={(e) => handleCandidateChange(index, 'description', e.target.value)}
                      placeholder="Enter candidate description"
                    />
                  </div>
                </div>
                {candidates.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeCandidate(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : poll ? 'Update Poll' : 'Create Poll'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
