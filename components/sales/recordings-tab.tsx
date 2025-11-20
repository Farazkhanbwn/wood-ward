"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Play,
  Pause,
  Trash2,
  Calendar,
  Clock,
  Mic,
  Download,
  Volume2,
  Eye,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react"

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

interface Recording {
  id: string
  title: string
  date: string
  duration: string
  size: string
  score?: number
  feedback?: CallFeedback
}

interface RecordingsTabProps {
  onNavigate?: (tab: string) => void
}

export function RecordingsTab({ onNavigate }: RecordingsTabProps) {
  const [recordings, setRecordings] = useState<Recording[]>([
    {
      id: "1",
      title: "Practice Call - Cold Outreach",
      date: "2024-01-20",
      duration: "12:34",
      size: "8.2 MB",
      score: 87,
    },
    {
      id: "2",
      title: "Practice Call - Objection Handling",
      date: "2024-01-18",
      duration: "15:22",
      size: "10.1 MB",
      score: 92,
    },
    {
      id: "3",
      title: "Practice Call - Discovery Questions",
      date: "2024-01-15",
      duration: "9:45",
      size: "6.4 MB",
      score: 78,
    },
    {
      id: "4",
      title: "Practice Call - Closing Techniques",
      date: "2024-01-12",
      duration: "18:12",
      size: "12.8 MB",
      score: 85,
    },
    {
      id: "5",
      title: "Practice Call - Value Proposition",
      date: "2024-01-10",
      duration: "11:28",
      size: "7.9 MB",
      score: 90,
    },
    {
      id: "6",
      title: "Practice Call - Follow-up Strategy",
      date: "2024-01-08",
      duration: "14:56",
      size: "9.7 MB",
      score: 83,
    },
  ])

  const [playingRecording, setPlayingRecording] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [viewingFeedback, setViewingFeedback] = useState<CallFeedback | null>(null)

  useEffect(() => {
    const savedFeedback = JSON.parse(localStorage.getItem("callFeedback") || "[]") as CallFeedback[]
    if (savedFeedback.length > 0) {
      const updatedRecordings = [
        ...savedFeedback.map((feedback) => ({
          id: feedback.callId,
          title: feedback.title,
          date: feedback.date,
          duration: feedback.duration,
          size: "5.2 MB", // Default size for new recordings
          score: feedback.overallScore,
          feedback: feedback,
        })),
        ...recordings,
      ]
      setRecordings(updatedRecordings)
    }
  }, [])

  const handlePlayPause = (recordingId: string) => {
    if (playingRecording === recordingId) {
      setPlayingRecording(null)
    } else {
      setPlayingRecording(recordingId)
    }
  }

  const handleDelete = (recordingId: string) => {
    setRecordings(recordings.filter((r) => r.id !== recordingId))
    setDeleteConfirm(null)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-blue-50 text-blue-700"
    if (score >= 80) return "bg-accent/10 text-accent"
    if (score >= 70) return "bg-chart-2/10 text-chart-2"
    return "bg-destructive/10 text-destructive"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="p-8 space-y-8" style={{ backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">My Recordings</h1>
        <p className="text-muted-foreground">Review and analyze your practice call recordings</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="animate-fade-in bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Mic className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Recordings</p>
                <p className="text-xl font-bold">{recordings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in bg-white" style={{ animationDelay: "0.1s" }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Clock className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Duration</p>
                <p className="text-xl font-bold">1h 22m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in bg-white" style={{ animationDelay: "0.2s" }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-1/10 rounded-lg">
                <Volume2 className="h-4 w-4 text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-xl font-bold">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in bg-white" style={{ animationDelay: "0.3s" }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-2/10 rounded-lg">
                <Download className="h-4 w-4 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-xl font-bold">55.1 MB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recordings List */}
      <div className="space-y-4">
        {recordings.map((recording, index) => (
          <Card
            key={recording.id}
            className="hover:shadow-lg transition-shadow duration-200 animate-slide-in bg-white"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    variant={playingRecording === recording.id ? "default" : "outline"}
                    onClick={() => handlePlayPause(recording.id)}
                    className="gap-2 bg-transparent"
                  >
                    {playingRecording === recording.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {playingRecording === recording.id ? "Pause" : "Play"}
                  </Button>

                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{recording.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(recording.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recording.duration}
                      </div>
                      <span>{recording.size}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {recording.score && (
                    <Badge className={getScoreColor(recording.score)}>Score: {recording.score}%</Badge>
                  )}

                  {recording.feedback && (
                    <Dialog
                      open={viewingFeedback?.callId === recording.id}
                      onOpenChange={(open) => setViewingFeedback(open ? recording.feedback! : null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <Eye className="h-3 w-3" />
                          View Feedback
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Call Feedback - {recording.title}</DialogTitle>
                          <DialogDescription>Performance analysis from {formatDate(recording.date)}</DialogDescription>
                        </DialogHeader>

                        {recording.feedback && (
                          <div className="space-y-6">
                            {/* Overall Score */}
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <div className="text-3xl font-bold text-blue-700 mb-2">
                                {recording.feedback.overallScore}%
                              </div>
                              <p className="text-sm text-muted-foreground">Overall Performance Score</p>
                            </div>

                            {/* Feedback Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Strengths */}
                              <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2 text-green-700">
                                  <CheckCircle className="h-4 w-4" />
                                  Strengths
                                </h4>
                                <div className="space-y-2">
                                  {recording.feedback.strengths.map((strength, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                      <p className="text-sm">{strength}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Weaknesses */}
                              <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2 text-red-700">
                                  <AlertCircle className="h-4 w-4" />
                                  Weaknesses
                                </h4>
                                <div className="space-y-2">
                                  {recording.feedback.weaknesses.map((weakness, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                      <p className="text-sm">{weakness}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Improvement Points */}
                              <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2 text-blue-700">
                                  <TrendingUp className="h-4 w-4" />
                                  Improvement Points
                                </h4>
                                <div className="space-y-2">
                                  {recording.feedback.improvementPoints.map((point, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                      <p className="text-sm">{point}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>

                  <Dialog
                    open={deleteConfirm === recording.id}
                    onOpenChange={(open) => setDeleteConfirm(open ? recording.id : null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 text-destructive hover:text-destructive bg-transparent border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Recording</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete "{recording.title}"? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => handleDelete(recording.id)}>
                          Delete
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Audio Player Simulation */}
              {playingRecording === recording.id && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg animate-fade-in">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-muted rounded-full h-2 relative">
                      <div className="bg-blue-700 h-2 rounded-full w-1/3 relative">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-700 rounded-full"></div>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">4:12 / {recording.duration}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {recordings.length === 0 && (
        <div className="text-center py-12">
          <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No recordings yet</h3>
          <p className="text-muted-foreground mb-4">Start a practice call to create your first recording</p>
          <Button className="gap-2" onClick={() => onNavigate?.("practice-call")}>
            <Play className="h-4 w-4" />
            Start Practice Call
          </Button>
        </div>
      )}
    </div>
  )
}
