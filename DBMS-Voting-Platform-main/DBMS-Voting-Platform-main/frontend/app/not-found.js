'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, LogIn, Users, Vote } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Page Not Found</CardTitle>
          <CardDescription>The page you requested doesn&apos;t exist or moved.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Button size="lg" onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2">
              <Home className="h-5 w-5" /> Go Home
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/login')}
              className="flex items-center justify-center gap-2">
              <LogIn className="h-5 w-5" /> Login
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="secondary" onClick={() => router.push('/admin')}
              className="flex items-center justify-center gap-2">
              <Users className="h-5 w-5" /> Admin Dashboard
            </Button>
            <Button variant="secondary" onClick={() => router.push('/vote')}
              className="flex items-center justify-center gap-2">
              <Vote className="h-5 w-5" /> Voter Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
