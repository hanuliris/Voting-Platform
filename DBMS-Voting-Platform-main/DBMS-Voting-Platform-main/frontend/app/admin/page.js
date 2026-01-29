'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/components/auth-provider'
import { adminApi, pollApi } from '@/lib/api'
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarClock,
  ClipboardList,
  FileSpreadsheet,
  LogOut,
  Plus,
  ShieldCheck,
  UserX,
  Users,
  Vote,
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function AdminPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [polls, setPolls] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isDeletingVoters, setIsDeletingVoters] = useState(false)

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

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleBulkDelete = async (scope) => {
    const confirmationMessage =
      scope === 'all'
        ? 'Are you sure you want to delete ALL polls? This cannot be undone.'
        : 'Are you sure you want to delete all ACTIVE polls? This cannot be undone.'

    if (!window.confirm(confirmationMessage)) {
      return
    }

    try {
      setIsBulkDeleting(true)
      if (scope === 'all') {
        await pollApi.deleteAllPolls()
      } else {
        await pollApi.deleteActivePolls()
      }
      await loadPolls()
    } catch (error) {
      console.error('Error deleting polls:', error)
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleDeleteAllVoters = async () => {
    if (!window.confirm('This will delete EVERY voter account and cannot be undone. Continue?')) {
      return
    }

    try {
      setIsDeletingVoters(true)
      await adminApi.deleteAllVoters()
      window.alert('All voter accounts were removed. Re-import a roster to keep voting open.')
    } catch (error) {
      console.error('Error deleting voters:', error)
      window.alert('Failed to delete voters. Check server logs and try again.')
    } finally {
      setIsDeletingVoters(false)
    }
  }

  const getStatusBadge = (poll) => {
    if (poll.status === 'ACTIVE') {
      return <Badge variant="default">Active</Badge>
    } else if (poll.status === 'COMPLETED') {
      return <Badge variant="outline">Completed</Badge>
    } else {
      return <Badge variant="secondary">Pending</Badge>
    }
  }

  const activePolls = polls.filter((p) => p.status === 'ACTIVE')
  const completedPolls = polls.filter((p) => p.status === 'COMPLETED')
  const scheduledPolls = polls.filter((p) => p.status !== 'ACTIVE' && p.status !== 'COMPLETED')

  const nextClosingPoll = [...activePolls]
    .filter((p) => p.endDate)
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))[0]

  const recentPolls = [...polls]
    .sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0))
    .slice(0, 4)

  const statCards = [
    {
      label: 'Active polls',
      value: activePolls.length,
      sub: 'Live right now',
      icon: Activity,
      accent: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Scheduled',
      value: scheduledPolls.length,
      sub: 'Pending launch',
      icon: CalendarClock,
      accent: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Completed',
      value: completedPolls.length,
      sub: 'Ready for reporting',
      icon: ClipboardList,
      accent: 'bg-indigo-100 text-indigo-700',
    },
  ]

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600/40 via-slate-900 to-slate-950">
          <div className="absolute inset-y-0 right-0 w-1/2 opacity-30" aria-hidden>
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_#6366f11a,_transparent_70%)]" />
          </div>
          <div className="relative z-10 container mx-auto px-4 py-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-wide text-white/70">Admin Control Center</p>
                <h1 className="mt-2 text-3xl font-bold">Welcome back, {user?.name}</h1>
                <p className="text-white/70">Track polls, onboard voters, and prove integrity from one screen.</p>
              </div>
              <Button
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {statCards.map((card) => (
                <Card key={card.label} className="border-white/10 bg-white/10 backdrop-blur">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className={`rounded-full p-3 ${card.accent}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">{card.label}</p>
                      <p className="text-3xl font-semibold text-white">{card.value}</p>
                      <p className="text-xs text-white/60">{card.sub}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-slate-800 bg-slate-900/60 text-white lg:col-span-2">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-2xl">Command actions</CardTitle>
                  <CardDescription className="text-slate-400">Everything you need within one click.</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => router.push('/admin/polls/create')}>
                    <Plus className="h-4 w-4 mr-2" /> New Poll
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => router.push('/admin/voters')}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" /> Import Voters
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-white/5 bg-white/5 p-4">
                  <h3 className="font-semibold">Integrity controls</h3>
                  <p className="text-sm text-slate-300">
                    Ledger, audit logs, and deletion tools stay in sync so you can respond to escalation instantly.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10"
                      onClick={() => router.push('/admin/ledger')}
                    >
                      <ShieldCheck className="h-4 w-4 mr-2" /> Ledger Proof
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-400/40 text-red-300 hover:bg-red-500/10"
                      disabled={isBulkDeleting || activePolls.length === 0}
                      onClick={() => handleBulkDelete('active')}
                    >
                      Close Active Polls
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-400/40 text-red-300 hover:bg-red-500/10"
                      disabled={isBulkDeleting || polls.length === 0}
                      onClick={() => handleBulkDelete('all')}
                    >
                      Purge All Polls
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-400/40 text-red-300 hover:bg-red-500/10"
                      disabled={isDeletingVoters}
                      onClick={handleDeleteAllVoters}
                    >
                      <UserX className="h-4 w-4 mr-2" /> Delete All Voters
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/5 p-4">
                  <h3 className="font-semibold">Upcoming milestones</h3>
                  {nextClosingPoll ? (
                    <div className="mt-4 space-y-2 text-sm text-slate-300">
                      <p className="text-white">{nextClosingPoll.title}</p>
                      <p>Ends {formatDateTime(nextClosingPoll.endDate)}</p>
                      <p className="text-xs text-slate-400">Ensure observers are notified before closing.</p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">No active polls are approaching their end date.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Ops snapshot</CardTitle>
                <CardDescription>Fast cues for live briefings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-slate-100 p-4 text-slate-900">
                  <p className="text-sm uppercase text-slate-500">Ledger</p>
                  <p className="text-lg font-semibold">0 chain breaks detected</p>
                  <p className="text-sm text-slate-500">Verify anytime from the ledger workspace.</p>
                </div>
                <div className="rounded-md bg-slate-100 p-4 text-slate-900">
                  <p className="text-sm uppercase text-slate-500">Voter onboarding</p>
                  <p className="text-lg font-semibold">Excel imports enabled</p>
                  <p className="text-sm text-slate-500">Share the template before the next election.</p>
                </div>
                <Button onClick={() => router.push('/admin/ledger')} className="w-full">
                  Open Oversight View
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <Card className="border-slate-200 lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Polls</CardTitle>
                <CardDescription>Click any card to manage candidates or view analytics.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12 text-slate-500">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-400" />
                  </div>
                ) : polls.length > 0 ? (
                  <div className="grid gap-4">
                    {recentPolls.map((poll) => (
                      <Card
                        key={poll.id}
                        className="border-slate-100 hover:border-primary hover:shadow-lg"
                        onClick={() => router.push(`/admin/polls/${poll.id}`)}
                      >
                        <CardHeader>
                          <div className="flex justify-between">
                            <div>
                              <CardTitle className="text-lg">{poll.title}</CardTitle>
                              <CardDescription>{poll.description}</CardDescription>
                            </div>
                            {getStatusBadge(poll)}
                          </div>
                        </CardHeader>
                        <CardContent className="grid gap-4 text-sm text-slate-600 md:grid-cols-2">
                          <div>
                            <span className="font-medium text-slate-900">Start:</span> {formatDateTime(poll.startDate)}
                          </div>
                          <div>
                            <span className="font-medium text-slate-900">End:</span> {formatDateTime(poll.endDate)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-slate-200 p-8 text-center text-slate-500">
                    No polls found. Start by creating your first election.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Playbook</CardTitle>
                <CardDescription>Keep the election team aligned.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-slate-600">
                  <div className="rounded-md border border-slate-100 p-4">
                    <p className="font-semibold text-slate-900">1. Prep voters</p>
                    <p>Confirm roster, send credentials, and remind them of the voting window.</p>
                  </div>
                  <div className="rounded-md border border-slate-100 p-4">
                    <p className="font-semibold text-slate-900">2. Monitor activity</p>
                    <p>Keep this dashboard open while polls run to watch health indicators.</p>
                  </div>
                  <div className="rounded-md border border-slate-100 p-4">
                    <p className="font-semibold text-slate-900">3. Prove the result</p>
                    <p>Use the ledger page + export to deliver receipts to stakeholders.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
