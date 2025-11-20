"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, PhoneOff, Mic, Clock, Lightbulb, CheckCircle, AlertCircle, TrendingUp, Save } from "lucide-react"

interface CallFeedback {
  strengths: string[]
  weaknesses: string[]
  improvementPoints: string[]
  overallScore: number
  callId: string
  date: string
  duration: string
  title: string
}

export function PracticeCallTab() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [notes, setNotes] = useState("")
  const [currentFeedback, setCurrentFeedback] = useState<CallFeedback | null>(null)

  const startCall = () => {
    setIsCallActive(true)
    setShowFeedback(false)
    setCurrentFeedback(null)
    // Start timer logic would go here
  }

  const endCall = () => {
    setIsCallActive(false)
    const feedback: CallFeedback = {
      strengths: [
        "Excellent rapport building at the beginning",
        "Asked relevant discovery questions",
        "Handled price objection professionally",
      ],
      weaknesses: [
        "Spoke too quickly during value proposition",
        "Missed opportunity to address budget concerns",
        "Could have been more confident in closing",
      ],
      improvementPoints: [
        "Practice slowing down speech during key moments",
        "Develop stronger budget qualification questions",
        "Work on assumptive closing techniques",
      ],
      overallScore: 78,
      callId: `call-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      duration: `${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, "0")}`,
      title: `Practice Call - ${new Date().toLocaleDateString()}`,
    }
    setCurrentFeedback(feedback)
    setShowFeedback(true)
  }

  const saveFeedback = () => {
    if (currentFeedback) {
      const existingFeedback = JSON.parse(localStorage.getItem("callFeedback") || "[]")
      existingFeedback.unshift(currentFeedback)
      localStorage.setItem("callFeedback", JSON.stringify(existingFeedback))

      console.log("[v0] Feedback saved:", currentFeedback)
      setShowFeedback(false)
      setCurrentFeedback(null)
      setNotes("")
    }
  }

  const callPrompts = [
    "Remember to ask open-ended questions",
    "Listen for pain points and challenges",
    "Present value proposition clearly",
    "Handle objections with empathy",
  ]

  if (showFeedback && currentFeedback) {
    return (
      <div className="p-8 space-y-8" style={{ backgroundColor: "#F9FAFB" }}>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Call Feedback Summary</h1>
          <p className="text-muted-foreground">Review your performance and areas for improvement</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Overall Score */}
          <Card className="text-center animate-fade-in bg-white">
            <CardHeader>
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-primary">{currentFeedback.overallScore}</span>
              </div>
              <CardTitle className="text-2xl">Overall Performance Score</CardTitle>
              <CardDescription>
                {currentFeedback.overallScore >= 90
                  ? "Excellent work!"
                  : currentFeedback.overallScore >= 80
                    ? "Good performance!"
                    : currentFeedback.overallScore >= 70
                      ? "Room for improvement"
                      : "Needs significant work"}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feedback Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strengths */}
            <Card className="animate-slide-in bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentFeedback.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm">{strength}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="animate-slide-in bg-white" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentFeedback.weaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm">{weakness}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Improvement Points */}
            <Card className="animate-slide-in bg-white" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <TrendingUp className="h-5 w-5" />
                  Improvement Points
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentFeedback.improvementPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm">{point}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={saveFeedback} className="gap-2">
              <Save className="h-5 w-5" />
              Save Feedback
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={startCall}
              className="gap-2 bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Phone className="h-5 w-5" />
              Start New Call
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8" style={{ backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">Practice Call</h1>
        <p className="text-muted-foreground">Role-play with AI to improve your sales skills</p>
      </div>

      {!isCallActive ? (
        /* Pre-Call View */
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="text-center animate-fade-in bg-white">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Practice?</CardTitle>
              <CardDescription>Start a role-play session with our AI sales trainer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Phone className="h-16 w-16 text-primary" />
              </div>
              <Button size="lg" onClick={startCall} className="w-full gap-2">
                <Phone className="h-5 w-5" />
                Start Practice Call
              </Button>
            </CardContent>
          </Card>

          <Card className="animate-slide-in bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Practice Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {callPrompts.map((tip, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* During Call View */
        <div className="max-w-2xl mx-auto">
          <Card className="animate-slide-in bg-white">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-4">
                <Badge variant="destructive" className="animate-pulse">
                  LIVE
                </Badge>
                <div className="flex items-center gap-2 text-lg font-mono">
                  <Clock className="h-4 w-4" />
                  {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, "0")}
                </div>
              </div>
              <CardTitle className="text-xl">Practice Call in Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="lg" className="gap-2 bg-transparent">
                  <Mic className="h-5 w-5" />
                  Mute
                </Button>
                <Button variant="destructive" size="lg" onClick={endCall} className="gap-2">
                  <PhoneOff className="h-5 w-5" />
                  End Call
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
