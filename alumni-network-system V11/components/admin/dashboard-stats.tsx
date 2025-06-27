"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, DollarSign, Briefcase, UserCheck } from "lucide-react"

interface DashboardStatsProps {
  data?: {
    users?: {
      total?: number
      new?: number
      byRole?: {
        alumni?: number
        moderator?: number
        admin?: number
      }
    }
    events?: {
      total?: number
      upcoming?: number
    }
    payments?: {
      totalRevenue?: number
      recentRevenue?: number
    }
    jobs?: {
      total?: number
    }
  }
}

export function DashboardStats({ data }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Provide default values to prevent undefined errors
  const stats = {
    users: {
      total: data?.users?.total || 0,
      new: data?.users?.new || 0,
      byRole: {
        alumni: data?.users?.byRole?.alumni || 0,
        moderator: data?.users?.byRole?.moderator || 0,
        admin: data?.users?.byRole?.admin || 0,
      }
    },
    events: {
      total: data?.events?.total || 0,
      upcoming: data?.events?.upcoming || 0,
    },
    payments: {
      totalRevenue: data?.payments?.totalRevenue || 0,
      recentRevenue: data?.payments?.recentRevenue || 0,
    },
    jobs: {
      total: data?.jobs?.total || 0,
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+{stats.users.new}</span> new this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Events</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.events.upcoming}</div>
          <p className="text-xs text-muted-foreground">{stats.events.total} total events</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.payments.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+{formatCurrency(stats.payments.recentRevenue)}</span> this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.jobs.total}</div>
          <p className="text-xs text-muted-foreground">Active job opportunities</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">User Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserCheck className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm">Alumni</span>
            </div>
            <span className="text-sm font-medium">{stats.users.byRole.alumni}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserCheck className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm">Moderators</span>
            </div>
            <span className="text-sm font-medium">{stats.users.byRole.moderator}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserCheck className="h-4 w-4 text-purple-500 mr-2" />
              <span className="text-sm">Administrators</span>
            </div>
            <span className="text-sm font-medium">{stats.users.byRole.admin}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
