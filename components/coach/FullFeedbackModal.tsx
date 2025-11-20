"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, Calendar, Clock, User, Target } from "lucide-react"
import FollowUpSessionModal from "./FollowUpSessionModal"

interface SessionData {
  id: number
  member: string
  date: string
  score: number
  scenario: string
  feedback: string
  duration?: number
}

interface FullFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  session: SessionData | null
}

export default function FullFeedbackModal({ isOpen, onClose, session }: FullFeedbackModalProps) {
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible || !session) return null

  const feedbackDetails = {
    strengths: [
      "Excellent opening and rapport building",
      "Clear product explanation",
      "Good listening skills demonstrated",
    ],
    improvements: [
      "Work on handling price objections",
      "Need more confidence in closing",
      "Follow-up questions could be more specific",
    ],
    scores: {
      opening: 90,
      presentation: 85,
      objectionHandling: 70,
      closing: 75,
      overall: 85,
    },
  }

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <Card className={`w-full max-w-3xl max-h-[90vh] flex flex-col bg-white shadow-xl transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-gray-900">Practice Session Feedback</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6 overflow-y-auto flex-1">
            {/* Session Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Participant</div>
                  <div className="font-medium text-gray-900">{session.member}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium text-gray-900">{session.date}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Scenario</div>
                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                    {session.scenario}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="font-medium text-gray-900">
                    {session.duration ? `${Math.floor(session.duration / 60)}:${(session.duration % 60).toString().padStart(2, '0')}` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Score */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="py-12 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{session.score}</div>
                <div className="text-blue-600 font-medium">Overall Score</div>
                <div className="text-sm text-blue-500 mt-1">Above average performance</div>
              </CardContent>
            </Card>

            {/* Detailed Scores */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Detailed Assessment</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Opening & Rapport</span>
                    <span className="text-gray-900">{feedbackDetails.scores.opening}%</span>
                  </div>
                  <Progress value={feedbackDetails.scores.opening} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Presentation Skills</span>
                    <span className="text-gray-900">{feedbackDetails.scores.presentation}%</span>
                  </div>
                  <Progress value={feedbackDetails.scores.presentation} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Objection Handling</span>
                    <span className="text-gray-900">{feedbackDetails.scores.objectionHandling}%</span>
                  </div>
                  <Progress value={feedbackDetails.scores.objectionHandling} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Closing Techniques</span>
                    <span className="text-gray-900">{feedbackDetails.scores.closing}%</span>
                  </div>
                  <Progress value={feedbackDetails.scores.closing} className="h-2" />
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div className="space-y-3">
              <h4 className="font-semibold  text-green-700">Strengths</h4>
              <div className="space-y-2">
                {feedbackDetails.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div className="space-y-3">
              <h4 className="font-semibold  text-orange-700">Areas for Improvement</h4>
              <div className="space-y-2">
                {feedbackDetails.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{improvement}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Coach Notes */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Coach Notes</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{session.feedback}</p>
                <p className="text-gray-700 mt-2">
                  Recommend focusing on objection handling techniques in the next session. Consider role-playing common
                  price objections and practicing confident responses.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <FollowUpSessionModal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        memberName={session.member}
        previousSession={session}
      />
    </>
  )
}
