"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Clock, TrendingUp, Phone } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function PerformancePage() {
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.getDashboardStats()
  })

  const { data: sessionsData, isLoading: loadingSessions } = useQuery({
    queryKey: ['allSessions'],
    queryFn: () => api.getCallSessions(100, 0)
  })

  // Debug: Console mein data check karo
  console.log('Stats Data:', statsData)
  console.log('Sessions Data:', sessionsData)

  if (loadingStats || loadingSessions) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">My Performance</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const stats = statsData?.stats || {}
  const sessions = sessionsData?.sessions || []

  console.log('Parsed Stats:', stats)
  console.log('Parsed Sessions:', sessions)

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Performance</h1>
        <p className="text-gray-600 mt-2">Track your progress and view all practice sessions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sessions</CardTitle>
            <Phone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionsData?.total || sessions.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Practice calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.length > 0 
                ? (sessions.reduce((sum: number, s: any) => sum + (s.feedback?.overallScore || 0), 0) / sessions.length).toFixed(1)
                : 0
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">Out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Practice Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.length > 0
                ? (sessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / 3600).toFixed(1)
                : 0
              }h
            </div>
            <p className="text-xs text-gray-500 mt-1">Total hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter((s: any) => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(s.createdAt) > weekAgo
              }).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* All Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Practice Sessions ({sessions.length})</CardTitle>
          <p className="text-sm text-gray-600">Complete history of your practice calls</p>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No practice sessions yet. Start your first call!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Call Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead>Top Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session: any) => (
                    <TableRow key={session._id}>
                      <TableCell className="font-medium">
                        {new Date(session.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{session.callType}</Badge>
                      </TableCell>
                      <TableCell>
                        {Math.floor(session.duration / 60)}m {session.duration % 60}s
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold text-lg ${
                          session.feedback?.overallScore >= 80 ? 'text-green-600' :
                          session.feedback?.overallScore >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {session.feedback?.overallScore || 0}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="space-y-1">
                          {session.feedback?.improvementPoints?.[0] && (
                            <p className="text-sm text-gray-700">
                              💡 {session.feedback.improvementPoints[0]}
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
