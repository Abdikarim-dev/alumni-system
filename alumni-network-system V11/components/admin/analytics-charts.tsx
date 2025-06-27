"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"

interface AnalyticsChartsProps {
  data?: {
    users?: {
      growthData?: Array<{ date: string; count: number }>
      byGraduationYear?: Array<{ year: number; count: number }>
    }
    payments?: {
      monthlyRevenue?: Array<{ month: string; revenue: number; transactions: number }>
    }
    events?: {
      byType?: Record<string, number>
    }
  }
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Provide default values to prevent undefined errors
  const userGrowthData = data?.users?.growthData || []
  const revenueData = data?.payments?.monthlyRevenue || []
  const graduationYearData = data?.users?.byGraduationYear || []
  
  // Convert event types object to array format for pie chart
  const eventTypeData = data?.events?.byType 
    ? Object.entries(data.events.byType).map(([type, count], index) => ({
        name: type,
        value: count,
        color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16"][index % 7],
      }))
    : []

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* User Growth Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>User Growth Trend</CardTitle>
          <CardDescription>Alumni registration over time</CardDescription>
        </CardHeader>
        <CardContent>
          {userGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip
                  labelFormatter={(label) => formatDate(label)}
                  formatter={(value: number) => [value, "New Users"]}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No growth data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
          <CardDescription>Revenue and transaction trends</CardDescription>
        </CardHeader>
        <CardContent>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "revenue" ? formatCurrency(value) : value,
                    name === "revenue" ? "Revenue" : "Transactions",
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="transactions" stroke="#f59e0b" name="Transactions" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No revenue data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Event Types Distribution</CardTitle>
          <CardDescription>Breakdown of event categories</CardDescription>
        </CardHeader>
        <CardContent>
          {eventTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No event type data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Graduation Year Distribution */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Alumni by Graduation Year</CardTitle>
          <CardDescription>Distribution of alumni across graduation years</CardDescription>
        </CardHeader>
        <CardContent>
          {graduationYearData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={graduationYearData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No graduation year data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
