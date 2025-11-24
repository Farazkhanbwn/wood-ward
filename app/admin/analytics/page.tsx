"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, Clock, TrendingUp, Eye, ArrowLeft } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminAnalyticsPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const { data: platformStats, isLoading: loadingPlatform, refetch: refetchPlatform } = useQuery({
    queryKey: ['platformStats'],
    queryFn: () => api.getPlatformStats(),
    refetchInterval: 10000, // Auto-refresh every 10 seconds
    staleTime: 0 // Always consider data stale
  })

  const { data: companyStats, isLoading: loadingCompanies, refetch: refetchCompany } = useQuery({
    queryKey: ['companyStats'],
    queryFn: () => api.getCompanyStats(),
    refetchInterval: 10000, // Auto-refresh every 10 seconds
    staleTime: 0 // Always consider data stale
  })

  const { data: allUsers } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => api.getAllUsers(),
    enabled: !selectedUser
  })

  const { data: userSessions, isLoading: loadingSessions } = useQuery({
    queryKey: ['userSessions', selectedUser],
    queryFn: () => api.getUserCallSessions(selectedUser!, 50, 0),
    enabled: !!selectedUser
  })

  if (selectedUser) {
    const user = allUsers?.users?.find((u: any) => u._id === selectedUser)
    const sessions = userSessions?.sessions || []

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedUser(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analytics
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{user?.name || 'User'} - Call History</h1>
          <p className="text-gray-600 mt-2">{user?.email}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Call Sessions ({sessions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSessions ? (
              <div className="text-center py-8">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No call sessions found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Call Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session: any) => (
                    <TableRow key={session._id}>
                      <TableCell>{new Date(session.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{session.callType}</Badge>
                      </TableCell>
                      <TableCell>{Math.floor(session.duration / 60)}m {session.duration % 60}s</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${
                          session.feedback?.overallScore >= 80 ? 'text-green-600' :
                          session.feedback?.overallScore >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {session.feedback?.overallScore || 0}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {session.feedback?.improvementPoints?.[0] || 'No feedback'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loadingPlatform || loadingCompanies) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
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

  const stats = platformStats?.stats || {}
  const companies = companyStats?.companyStats || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600 mt-2">Overview of all platform activity and performance</p>
        </div>
        <Button 
          onClick={() => { refetchPlatform(); refetchCompany(); }}
          variant="outline"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Platform Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Calls</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCalls || 0}</div>
            <p className="text-xs text-gray-500 mt-1">All practice sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Platform average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours || 0}h</div>
            <p className="text-xs text-gray-500 mt-1">Practice time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Verified accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Company Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Company Performance</CardTitle>
          <p className="text-sm text-gray-600">Breakdown by company</p>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No company data available
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead className="text-right">Total Calls</TableHead>
                  <TableHead className="text-right">Avg Score</TableHead>
                  <TableHead className="text-right">Total Hours</TableHead>
                  <TableHead className="text-right">Active Reps</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company: any) => (
                  <TableRow key={company.companyId}>
                    <TableCell className="font-medium">{company.companyName}</TableCell>
                    <TableCell className="text-right">{company.totalCalls}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${
                        parseFloat(company.avgScore) >= 80 ? 'text-green-600' :
                        parseFloat(company.avgScore) >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {company.avgScore}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{company.totalHours}h</TableCell>
                    <TableCell className="text-right">{company.activeReps}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* All Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <p className="text-sm text-gray-600">Click on a user to view their call history</p>
        </CardHeader>
        <CardContent>
          {!allUsers?.users || allUsers.users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.users.filter((u: any) => u.role === 'sales').map((user: any) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isEmailVerified ? 'default' : 'outline'}>
                        {user.isEmailVerified ? 'Active' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user._id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Calls
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
