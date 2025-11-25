"use client"

import { useState } from "react"
import { usePlaybooks } from "@/hooks/use-playbooks"
import { useDashboardStats, useCallSessions } from "@/hooks/use-call-sessions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookOpen, Phone, Star, Clock, Sparkles, Save, RotateCcw, BarChart3 } from "lucide-react"
import { StatsCardSkeleton, RecentActivitySkeleton, QuickActionSkeleton } from "@/components/ui/loading-skeletons"

interface DashboardTabProps {
  onNavigate?: (tab: string, options?: { startPlaybookCreation?: boolean }) => void
}

interface AIGenerationForm {
  productService: string
  targetPersona: string
  additionalContext: string
  scriptType: "call" | "email" | "value-points" | "questions"
}

export function DashboardTab({ onNavigate }: DashboardTabProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState<string | null>(null)
  const [aiForm, setAiForm] = useState<AIGenerationForm>({
    productService: "",
    targetPersona: "",
    additionalContext: "",
    scriptType: "call",
  })

  const { data: playbooksData } = usePlaybooks()
  const { data: dashboardStats, isLoading: isLoadingStats } = useDashboardStats()
  const { data: allSessionsData } = useCallSessions(100, 0)

  const allSessions = allSessionsData?.sessions || []

  const playbookCount = playbooksData?.length ?? null

  const stats = [
    {
      title: "Active Playbooks",
      value: playbookCount === null ? "..." : playbookCount.toString(),
      description: "Your created playbooks",
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Call Simulations",
      value: allSessions.length.toString(),
      description: "Practice sessions completed",
      icon: Phone,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Average Score",
      value: allSessions.length > 0 
        ? (allSessions.reduce((sum: number, s: any) => sum + (s.feedback?.overallScore || 0), 0) / allSessions.length).toFixed(1)
        : "0",
      description: "Out of 100 points",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Time Practiced",
      value: allSessions.length > 0
        ? `${(allSessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / 3600).toFixed(1)}h`
        : "0h",
      description: "Total practice time",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const getCallTypeLabel = (callType: string) => {
    const labels: Record<string, string> = {
      'cold-call': 'Cold Call',
      'discovery-call': 'Discovery Call',
      'demo-call': 'Demo Call',
      'follow-up-call': 'Follow-up Call',
    }
    return labels[callType] || callType
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
  }

  const recentActivities: Array<{ action: string; time: string; type: string }> = dashboardStats?.recentSessions?.map((session: any) => ({
    action: `Completed '${getCallTypeLabel(session.callType)}' simulation`,
    time: `${getTimeAgo(session.createdAt)} • Score: ${session.feedback.overallScore}/100`,
    type: session.feedback.overallScore >= 80 ? 'success' : 'info',
  })) || []

  const generateScript = async () => {
    console.log("[v0] Generating AI script with form data:", aiForm)

    const mockScripts = {
      call: `Hi [Name], this is [Your Name] from [Company]. I specialize in helping ${aiForm.targetPersona} with ${aiForm.productService}. ${aiForm.additionalContext ? aiForm.additionalContext + " " : ""}I know you're busy, so I'll be brief. Do you have 30 seconds for me to explain how we can help?`,
      email: `Subject: ${aiForm.productService} solution for ${aiForm.targetPersona}\\n\\nHi [Name],\\n\\nI hope this email finds you well. I'm reaching out because I help ${aiForm.targetPersona} with ${aiForm.productService}.\\n\\n${aiForm.additionalContext}\\n\\nI'd love to schedule a brief 15-minute call to discuss how we can help [Company] achieve similar results.\\n\\nBest regards,\\n[Your Name]`,
      "value-points": `• ${aiForm.productService} specifically designed for ${aiForm.targetPersona}\\n• ${aiForm.additionalContext}\\n• Proven results with similar companies\\n• Quick implementation and ROI\\n• Dedicated support team`,
      questions: `• What's your biggest challenge with ${aiForm.productService.toLowerCase()}?\\n• How does your team currently handle [specific process]?\\n• What would solving this problem mean for ${aiForm.targetPersona}?\\n• ${aiForm.additionalContext ? "How important is " + aiForm.additionalContext.toLowerCase() + " to your business?" : "What's your timeline for implementing a solution?"}\\n• Who else is involved in making this decision?`,
    }

    setTimeout(() => {
      setGeneratedScript(mockScripts[aiForm.scriptType])
    }, 1500)
  }

  const saveGeneratedScript = () => {
    if (generatedScript) {
      const existingScripts = JSON.parse(localStorage.getItem("aiScripts") || "[]")
      const script = {
        id: Date.now().toString(),
        title: `${getScriptTypeLabel(aiForm.scriptType)} - ${aiForm.productService}`,
        type: aiForm.scriptType,
        content: generatedScript,
        dateCreated: new Date().toISOString().split("T")[0],
        isAIGenerated: true,
      }
      localStorage.setItem("aiScripts", JSON.stringify([script, ...existingScripts]))

      setGeneratedScript(null)
      setAiForm({ productService: "", targetPersona: "", additionalContext: "", scriptType: "call" })
      setIsGenerating(false)

      onNavigate?.("my-scripts")
    }
  }

  const discardGeneratedScript = () => {
    setGeneratedScript(null)
    setAiForm({ productService: "", targetPersona: "", additionalContext: "", scriptType: "call" })
  }

  const getScriptTypeLabel = (type: AIGenerationForm["scriptType"]) => {
    switch (type) {
      case "call":
        return "Call Script"
      case "email":
        return "Email Template"
      case "value-points":
        return "Value Points"
      case "questions":
        return "Questions"
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-gray-50 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, Demo User!</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Ready to enhance your sales skills? Let's get started with your coaching session.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoadingStats ? (
          Array.from({ length: 4 }).map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))
        ) : (
          stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Quick Actions</h2>
            <p className="text-gray-600 text-sm">Jump into your most common tasks</p>
          </div>

          <div className="space-y-4">
            <Button
              size="lg"
              variant="outline"
              className="w-full justify-start gap-3 h-16 p-4 bg-white border-gray-200 hover:bg-gray-50"
              onClick={() => onNavigate?.("playbooks", { startPlaybookCreation: true })}
            >
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">Create New Playbook</div>
                <div className="text-sm text-gray-600 truncate">Build a new sales playbook with AI assistance</div>
              </div>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full justify-start gap-3 h-16 p-4 bg-white border-gray-200 hover:bg-gray-50"
              onClick={() => onNavigate?.("call-simulation")}
            >
              <div className="p-2 bg-green-100 rounded-lg shrink-0">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">Start Call Simulation</div>
                <div className="text-sm text-gray-600 truncate">Practice your pitch with AI prospects</div>
              </div>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full justify-start gap-3 h-16 p-4 bg-white border-gray-200 hover:bg-gray-50"
              onClick={() => onNavigate?.("playbooks")}
            >
              <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">View All Playbooks</div>
                <div className="text-sm text-gray-600 truncate">Access your saved playbooks and templates</div>
              </div>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Recent Activity</h2>
            <p className="text-gray-600 text-sm">Your latest coaching sessions and improvements</p>
          </div>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              {isLoadingStats ? (
                <RecentActivitySkeleton />
              ) : recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-900 mb-1">No recent activity</p>
                  <p className="text-xs text-gray-500">Start a call simulation to see your activity here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${activity.type === "success"
                          ? "bg-primary"
                          : activity.type === "info"
                            ? "bg-green-500"
                            : "bg-purple-500"
                          }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 leading-relaxed">{activity.action}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isGenerating} onOpenChange={setIsGenerating}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate AI Script</DialogTitle>
            <DialogDescription>Provide details to generate a customized script using AI</DialogDescription>
          </DialogHeader>

          {!generatedScript ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product / Service Name</label>
                <Input
                  placeholder="e.g., CRM Software, Marketing Automation, etc."
                  value={aiForm.productService}
                  onChange={(e) => setAiForm({ ...aiForm, productService: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Persona</label>
                <Input
                  placeholder="e.g., Small Business Owners, Marketing Directors, etc."
                  value={aiForm.targetPersona}
                  onChange={(e) => setAiForm({ ...aiForm, targetPersona: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Script Type</label>
                <select
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={aiForm.scriptType}
                  onChange={(e) =>
                    setAiForm({ ...aiForm, scriptType: e.target.value as AIGenerationForm["scriptType"] })
                  }
                >
                  <option value="call">Call Script</option>
                  <option value="email">Email Template</option>
                  <option value="value-points">Value Points</option>
                  <option value="questions">Discovery Questions</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Context / Value Points</label>
                <Textarea
                  placeholder="Any specific benefits, features, or context you want to include..."
                  value={aiForm.additionalContext}
                  onChange={(e) => setAiForm({ ...aiForm, additionalContext: e.target.value })}
                  className="min-h-24"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsGenerating(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={generateScript}
                  disabled={!aiForm.productService || !aiForm.targetPersona}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Script
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Generated Script</label>
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <pre className="text-sm whitespace-pre-wrap font-sans text-foreground">{generatedScript}</pre>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={discardGeneratedScript}>
                  Discard
                </Button>
                <Button variant="outline" onClick={() => setGeneratedScript(null)} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Regenerate
                </Button>
                <Button onClick={saveGeneratedScript} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save to My Scripts
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
