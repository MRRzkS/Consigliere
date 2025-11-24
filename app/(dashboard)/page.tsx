"use client"

import { useStore } from "@/store/useStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Briefcase, CheckCircle, Wallet, ArrowUpRight, ArrowDownLeft, Calendar, Plus } from "lucide-react"
import { formatCurrency } from "@/lib/formatCurrency"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { formatDistanceToNow } from "date-fns"

// Mock data for sparklines
const dataProfit = [
  { value: 100 }, { value: 120 }, { value: 110 }, { value: 130 }, { value: 140 }, { value: 150 }, { value: 160 }
]
const dataOperations = [
  { value: 5 }, { value: 6 }, { value: 5 }, { value: 7 }, { value: 8 }, { value: 8 }, { value: 9 }
]
const dataSuccess = [
  { value: 80 }, { value: 82 }, { value: 85 }, { value: 88 }, { value: 90 }, { value: 92 }, { value: 95 }
]
const dataTreasury = [
  { value: 2000 }, { value: 2100 }, { value: 2050 }, { value: 2200 }, { value: 2300 }, { value: 2400 }, { value: 2500 }
]

import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

import QuoteCarousel from "@/components/dashboard/QuoteCarousel"

export default function OverviewPage() {
  const { projects, transactions, setProjects, setTransactions } = useStore()

  useEffect(() => {
    const fetchData = async () => {
      // Fetch projects if empty
      if (projects.length === 0) {
        const { data: projectsData } = await supabase.from('projects').select('*')
        if (projectsData) setProjects(projectsData)
      }

      // Fetch transactions if empty
      if (transactions.length === 0) {
        const { data: transactionsData } = await supabase.from('transactions').select('*').order('date', { ascending: false })
        if (transactionsData) setTransactions(transactionsData)
      }
    }

    fetchData()
  }, [projects.length, transactions.length, setProjects, setTransactions])

  const totalProfit = transactions
    .filter(t => t.type === 'Income')
    .reduce((acc, curr) => acc + curr.amount, 0) -
    transactions
      .filter(t => t.type === 'Expense')
      .reduce((acc, curr) => acc + curr.amount, 0)

  const activeOperations = projects.filter(p => p.status !== 'Deployed').length
  const successRate = projects.length > 0
    ? Math.round((projects.filter(p => p.status === 'Deployed').length / projects.length) * 100)
    : 0

  const treasury = totalProfit // Simplified for now

  const priorityTargets = projects
    .filter(p => p.status === 'In Development' || p.status === 'Negotiation')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <QuoteCarousel />
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Profit"
          value={formatCurrency(totalProfit, true)}
          icon={DollarSign}
          trend="+20.1% from last month"
          data={dataProfit}
          color="#10b981" // Emerald 500
        />
        <StatCard
          title="Active Operations"
          value={activeOperations.toString()}
          icon={Briefcase}
          trend="Projects in progress"
          data={dataOperations}
          color="#3b82f6" // Blue 500
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          icon={CheckCircle}
          trend="Completion rate"
          data={dataSuccess}
          color="#8b5cf6" // Violet 500
        />
        <StatCard
          title="Treasury"
          value={formatCurrency(treasury, true)}
          icon={Wallet}
          trend="Available funds"
          data={dataTreasury}
          color="#f59e0b" // Amber 500
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Recent Activity (2/3) */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest financial movements.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${t.type === 'Income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {t.type === 'Income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.category} • {new Date(t.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-medium ${t.type === 'Income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Targets (1/3) */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Priority Targets</CardTitle>
            <CardDescription>Upcoming deadlines.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {priorityTargets.length > 0 ? (
                priorityTargets.map((p) => {
                  const daysLeft = Math.ceil((new Date(p.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  const isUrgent = daysLeft <= 3
                  return (
                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0 gap-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium truncate max-w-[200px]">{p.clientName}</p>
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                          {p.status}
                        </Badge>
                      </div>
                      <div className={`text-xs font-medium flex items-center gap-1 ${isUrgent ? 'text-rose-500' : 'text-yellow-500'}`}>
                        <Calendar className="h-3 w-3" />
                        {daysLeft < 0 ? 'Overdue' : `${daysLeft} days left`}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">No urgent deadlines.</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="mr-2 h-3 w-3" />
                    Create Proposal
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, trend, data, color }: any) {
  return (
    <Card className="overflow-hidden relative border-muted/50 bg-gradient-to-br from-card to-card/50 hover:from-card hover:to-accent/5 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="z-10 relative">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{trend}</p>
      </CardContent>
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={data}>
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
