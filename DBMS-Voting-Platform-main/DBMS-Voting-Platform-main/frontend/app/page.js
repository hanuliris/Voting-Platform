'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle,
  FileSpreadsheet,
  Link,
  ListChecks,
  Lock,
  ScrollText,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Vote,
} from 'lucide-react'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect authenticated users to their appropriate dashboard
      switch (user.role) {
        case 'ADMIN':
          router.push('/admin')
          break
        case 'VOTER':
          router.push('/vote')
          break
        default:
          router.push('/vote')
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect above
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-blue-500/10 to-transparent" />
        <div className="container relative z-10 mx-auto px-4 pb-16 pt-24">
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-sm text-white/80">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Provably secure elections for campuses, boards, and teams
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Run trusted votes with cryptographic receipts and effortless onboarding.
            </h1>
            <p className="mt-6 text-lg text-slate-200">
              SecureVote pairs a modern Next.js experience with a Spring Boot API, blockchain-style ledger, and audit-ready
              exports so you can prove outcomes in minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" onClick={() => router.push('/login')}>
                Launch Console
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => router.push('/register')}>
                Register as Voter
              </Button>
            </div>
            <div className="mt-12 grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="grid gap-4 text-left sm:grid-cols-3">
                {[{
                  label: 'Ledger-backed events',
                  value: '100% traced',
                  icon: ShieldCheck,
                },
                {
                  label: 'Average setup time',
                  value: '8 minutes',
                  icon: FileSpreadsheet,
                },
                {
                  label: 'Concurrent voters',
                  value: '5K capacity',
                  icon: Activity,
                }].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="rounded-full bg-white/10 p-3">
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">{stat.label}</p>
                      <p className="text-xl font-semibold">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60">
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[{
              title: 'Zero-trust security',
              copy: 'JWT auth, bcrypt hashing, and least-privilege scopes on every API.',
              icon: Shield,
            },
            {
              title: 'Guided onboarding',
              copy: 'Excel imports create accounts + temporary passwords in seconds.',
              icon: FileSpreadsheet,
            },
            {
              title: 'Live intelligence',
              copy: 'Results stream instantly so admins can react in real-time.',
              icon: BarChart3,
            },
            {
              title: 'Provable audit trail',
              copy: 'Each poll/vote hits the immutable ledger with chained hashes.',
              icon: ListChecks,
            }].map((feature) => (
              <Card key={feature.title} className="border-white/10 bg-white/5">
                <CardHeader>
                  <div className="mb-4 inline-flex rounded-full bg-indigo-500/20 p-3">
                    <feature.icon className="h-5 w-5 text-indigo-200" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-200">{feature.copy}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <Card className="border-white/10 bg-slate-900/70 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <ScrollText className="h-6 w-6 text-emerald-300" />
                Ledger-backed Proof
              </CardTitle>
              <CardDescription className="text-slate-300">
                Every block links to the one before it. Break the chain, and the admin dashboard flags it instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-emerald-400/40 bg-black/40 p-4 font-mono text-xs text-emerald-100">
                <p className="text-emerald-300">#1185 · VOTE · CAST</p>
                <p>hash · 0xaa1c9b...55a1</p>
                <p>prev · 0xd04b34...91de</p>
                <p>payload · poll:42 | candidate:3 | voter:884</p>
              </div>
              <p className="text-sm text-slate-200">
                Bring auditors to `/admin/ledger` and walk them through the proof checklist built into the UI. Export
                the data or recompute SHA-256 hashes live.
              </p>
              <Button
                variant="outline"
                className="border-emerald-400/50 bg-transparent text-emerald-200 hover:bg-emerald-500/10"
                onClick={() => router.push('/admin/ledger')}
              >
                Preview Ledger View
                <Link className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl">3-step voter journey</CardTitle>
              <CardDescription>Designed for non-technical stakeholders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    step: '01',
                    title: 'Invite voters',
                    copy: 'Upload a roster or add people manually. We email credentials instantly.',
                    icon: Users,
                  },
                  {
                    step: '02',
                    title: 'Launch polls',
                    copy: 'Define timelines, candidates, and guardrails from the admin workspace.',
                    icon: Vote,
                  },
                  {
                    step: '03',
                    title: 'Share proof',
                    copy: 'Ledger, results, and exports stay in sync for any audit.',
                    icon: ShieldCheck,
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-muted-foreground">{item.step}</div>
                      <div className="mt-1 rounded-full border border-slate-200 p-3">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="border-t border-white/10 bg-slate-900/70">
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">Tech stack</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Built for resilience</h3>
            </div>
            <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
              {[{
                title: 'Next.js 14',
                copy: 'Streaming UI + server actions.',
              },
              {
                title: 'Spring Boot 3 + Java 21',
                copy: 'JWT, auditing, Excel ingestion.',
              },
              {
                title: 'MySQL 8',
                copy: 'Transactional vote storage.',
              },
              {
                title: 'Docker Compose',
                copy: 'Run the full stack with one command.',
              }].map((stack) => (
                <Card key={stack.title} className="border-white/10 bg-white/5">
                  <CardContent className="p-4">
                    <p className="font-semibold text-white">{stack.title}</p>
                    <p className="text-sm text-slate-200">{stack.copy}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-blue-500">
        <div className="container mx-auto px-4 py-16 text-center text-white">
          <p className="text-sm uppercase tracking-wide text-white/80">Ready to launch?</p>
          <h2 className="mt-4 text-3xl font-bold">Spin up a verifiable election in under 10 minutes.</h2>
          <p className="mt-3 text-lg text-white/80">
            Deploy with Docker, invite voters with an Excel file, and keep auditors happy with the built-in ledger view.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" onClick={() => router.push('/login')}>
              Access Admin Portal
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white bg-transparent text-white hover:bg-white/10"
              onClick={() => router.push('/admin/ledger')}
            >
              Preview Ledger Proof
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
