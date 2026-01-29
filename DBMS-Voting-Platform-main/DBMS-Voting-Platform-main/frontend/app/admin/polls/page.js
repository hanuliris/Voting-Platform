'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/protected-route'
import { ClipboardList, ArrowLeft } from 'lucide-react'

export default function PollsIndexPage() {
  const router = useRouter()

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ClipboardList className="h-6 w-6 text-primary" />
              Polls Workspace
            </CardTitle>
            <CardDescription>
              Use the admin dashboard to view polls. You can also jump directly to creating a poll or return to the dashboard below.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <Button className="flex-1" onClick={() => router.push('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
            <Button className="flex-1" onClick={() => router.push('/admin/polls/create')}>
              Create Poll
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
