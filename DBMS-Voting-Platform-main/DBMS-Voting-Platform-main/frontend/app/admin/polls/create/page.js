'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/protected-route'
import { PollForm } from '@/components/poll-form'
import { ArrowLeft } from 'lucide-react'

export default function CreatePollPage() {
  const router = useRouter()

  const handleSuccess = (poll) => {
    router.push(`/admin`)
  }

  const handleCancel = () => {
    router.push('/admin')
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button variant="outline" onClick={() => router.push('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Create New Poll</h1>
              <p className="text-muted-foreground">Set up a new voting poll with schedule and candidates</p>
            </div>

            <PollForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
