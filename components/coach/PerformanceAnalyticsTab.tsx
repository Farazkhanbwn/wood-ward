"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, TrendingUp, Clock, Star } from "lucide-react"

interface TeamMember {
    id: number
    name: string
    email: string
    role: string
    score: number
    status: string
}

interface PerformanceAnalyticsTabProps {
    teamMembers: TeamMember[]
}

export default function PerformanceAnalyticsTab({ teamMembers }: PerformanceAnalyticsTabProps) {
    const activeMembers = teamMembers.filter(m => m.status === "Active").length
    const totalMembers = teamMembers.length

    // Dummy data for top performers until practice sessions are implemented
    const dummyTopPerformers = [
        { id: 1, name: "John Smith", email: "john@company.com", role: "Sales Rep", score: 92, status: "Active" },
        { id: 2, name: "Sarah Johnson", email: "sarah@company.com", role: "Sales Rep", score: 88, status: "Active" },
        { id: 3, name: "Mike Davis", email: "mike@company.com", role: "Sales Rep", score: 85, status: "Active" },
    ]

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="transition-all duration-200 hover:shadow-lg bg-white border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">85.2</div>
                        <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-gray-500">from last month</p>
                            <Badge className="bg-blue-100 text-blue-700 text-xs">+2.1%</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="transition-all duration-200 hover:shadow-lg bg-white border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Active Members</CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{activeMembers}</div>
                        <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-gray-500">out of {totalMembers} total</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="transition-all duration-200 hover:shadow-lg bg-white border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Practice Sessions</CardTitle>
                        <Clock className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">47</div>
                        <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-gray-500">this week</p>
                            <Badge className="bg-blue-100 text-blue-700 text-xs">+8</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white border-gray-200">
                <CardHeader>
                    <CardTitle className="text-gray-900">Top Performers</CardTitle>
                    <CardDescription className="text-gray-600">
                        Team members with highest scores this month
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {dummyTopPerformers.map((member, index) => (
                                <div key={member.id} className="flex items-center space-x-4">
                                    <div
                                        className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold"
                                        style={{ backgroundColor: "#284EA7" }}
                                    >
                                        {index + 1}
                                    </div>
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage
                                            src={`/abstract-geometric-shapes.png?height=40&width=40&query=${member.name} avatar`}
                                        />
                                        <AvatarFallback className="bg-blue-100 text-blue-600">
                                            {member.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{member.name}</p>
                                        <p className="text-sm text-gray-600">{member.role}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        <span className="font-bold text-gray-900">{member.score}</span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
