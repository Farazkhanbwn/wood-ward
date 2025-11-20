"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { X, Mail, Calendar, TrendingUp } from "lucide-react"

interface MemberData {
  id: number
  name: string
  email: string
  role: string
  score: number
  status: string
}

interface MemberProfileModalProps {
  isOpen: boolean
  onClose: () => void
  member: MemberData | null
}

export default function MemberProfileModal({ isOpen, onClose, member }: MemberProfileModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible || !member) return null

  const recentSessions = [
    { date: "2024-01-15", score: 85, scenario: "Cold Call" },
    { date: "2024-01-12", score: 78, scenario: "Product Demo" },
    { date: "2024-01-10", score: 92, scenario: "Closing" },
  ]

  return (
    <div 
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <Card className={`w-full max-w-2xl max-h-[90vh] flex flex-col bg-white shadow-xl transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-900 text-md">Member Profile</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto flex-1 ">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`/abstract-geometric-shapes.png?height=80&width=80&query=${member.name} avatar`} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                {member.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
              <p className="text-gray-600">{member.role}</p>
              <div className="flex flex-col md:flex-row items-start md:items-center md:space-x-4 mt-2">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Mail className="h-4 w-4" />
                  <span>{member.email}</span>
                </div>
                <Badge
                  variant={member.status === "Active" ? "default" : "secondary"}
                  className={member.status === "Active" ? "bg-green-100 text-green-700  mt-2 md:mt-0" : "bg-gray-100 text-gray-600  mt-2 md:mt-0"}
                >
                  {member.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="py-10 text-center">
                <div className="text-2xl font-bold text-blue-600">{member.score}</div>
                <div className="text-sm text-blue-600">Current Score</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="py-10 text-center">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-green-600">Sessions This Month</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="py-10 text-center">
                <div className="text-2xl font-bold text-purple-600">85%</div>
                <div className="text-sm text-purple-600">Improvement Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Progress */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Skills Assessment</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Cold Calling</span>
                  <span className="text-gray-900">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Product Knowledge</span>
                  <span className="text-gray-900">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Closing Techniques</span>
                  <span className="text-gray-900">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Recent Practice Sessions</h4>
            <div className="space-y-2">
              {recentSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{session.scenario}</div>
                      <div className="text-sm text-gray-500">{session.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-bold text-gray-900">{session.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
