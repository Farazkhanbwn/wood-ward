"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Edit, Save, Calendar, Mail, Phone, HelpCircle, Sparkles, RotateCcw, Trash2 } from "lucide-react"

interface Script {
  id: string
  title: string
  type: "call" | "email" | "value-points" | "questions"
  content: string
  dateCreated: string
  isAIGenerated: boolean
}

interface AIGenerationForm {
  productService: string
  targetPersona: string
  additionalContext: string
  scriptType: Script["type"]
}

export function MyScriptsTab() {
  const [scripts, setScripts] = useState<Script[]>([
    {
      id: "1",
      title: "Cold Call Opening Script",
      type: "call",
      content:
        "Hi [Name], this is [Your Name] from [Company]. I know you're busy, so I'll be brief. We help companies like yours reduce operational costs by 20-30%. Do you have 30 seconds for me to explain how?",
      dateCreated: "2024-01-15",
      isAIGenerated: true,
    },
    {
      id: "2",
      title: "Follow-up Email Template",
      type: "email",
      content:
        "Subject: Quick follow-up on our conversation\\n\\nHi [Name],\\n\\nThanks for taking the time to speak with me yesterday. As discussed, I'm attaching the case study that shows how we helped [Similar Company] achieve [Specific Result].\\n\\nI'd love to schedule a brief 15-minute call to discuss how we can help [Their Company] achieve similar results.\\n\\nBest regards,\\n[Your Name]",
      dateCreated: "2024-01-12",
      isAIGenerated: true,
    },
    {
      id: "3",
      title: "Value Proposition Points",
      type: "value-points",
      content:
        "• 20-30% reduction in operational costs\\n• Improved efficiency through automation\\n• 24/7 customer support\\n• ROI typically seen within 3 months\\n• Trusted by 500+ companies worldwide",
      dateCreated: "2024-01-10",
      isAIGenerated: true,
    },
    {
      id: "4",
      title: "Discovery Questions",
      type: "questions",
      content:
        "• What's your biggest challenge with [current process]?\\n• How much time does your team spend on [specific task]?\\n• What would solving this problem mean for your business?\\n• Who else is involved in making this decision?\\n• What's your timeline for implementing a solution?",
      dateCreated: "2024-01-08",
      isAIGenerated: true,
    },
  ])

  const [editingScript, setEditingScript] = useState<Script | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState<string | null>(null)
  const [aiForm, setAiForm] = useState<AIGenerationForm>({
    productService: "",
    targetPersona: "",
    additionalContext: "",
    scriptType: "call",
  })

  const generateScript = async () => {
    console.log("[v0] Generating AI script with form data:", aiForm)

    // Simulate AI generation
    const mockScripts = {
      call: `Hi [Name], this is [Your Name] from [Company]. I specialize in helping ${aiForm.targetPersona} with ${aiForm.productService}. ${aiForm.additionalContext ? aiForm.additionalContext + " " : ""}I know you're busy, so I'll be brief. Do you have 30 seconds for me to explain how we can help?`,
      email: `Subject: ${aiForm.productService} solution for ${aiForm.targetPersona}\n\nHi [Name],\n\nI hope this email finds you well. I'm reaching out because I help ${aiForm.targetPersona} with ${aiForm.productService}.\n\n${aiForm.additionalContext}\n\nI'd love to schedule a brief 15-minute call to discuss how we can help [Company] achieve similar results.\n\nBest regards,\n[Your Name]`,
      "value-points": `• ${aiForm.productService} specifically designed for ${aiForm.targetPersona}\n• ${aiForm.additionalContext}\n• Proven results with similar companies\n• Quick implementation and ROI\n• Dedicated support team`,
      questions: `• What's your biggest challenge with ${aiForm.productService.toLowerCase()}?\n• How does your team currently handle [specific process]?\n• What would solving this problem mean for ${aiForm.targetPersona}?\n• ${aiForm.additionalContext ? "How important is " + aiForm.additionalContext.toLowerCase() + " to your business?" : "What's your timeline for implementing a solution?"}\n• Who else is involved in making this decision?`,
    }

    setTimeout(() => {
      setGeneratedScript(mockScripts[aiForm.scriptType])
    }, 1500)
  }

  const saveGeneratedScript = () => {
    if (generatedScript) {
      const script: Script = {
        id: Date.now().toString(),
        title: `${getScriptTypeLabel(aiForm.scriptType)} - ${aiForm.productService}`,
        type: aiForm.scriptType,
        content: generatedScript,
        dateCreated: new Date().toISOString().split("T")[0],
        isAIGenerated: true,
      }
      setScripts([script, ...scripts])
      setGeneratedScript(null)
      setAiForm({ productService: "", targetPersona: "", additionalContext: "", scriptType: "call" })
      setIsGenerating(false)
    }
  }

  const discardGeneratedScript = () => {
    setGeneratedScript(null)
    setAiForm({ productService: "", targetPersona: "", additionalContext: "", scriptType: "call" })
  }

  const getScriptIcon = (type: Script["type"]) => {
    switch (type) {
      case "call":
        return Phone
      case "email":
        return Mail
      case "value-points":
        return FileText
      case "questions":
        return HelpCircle
    }
  }

  const getScriptTypeLabel = (type: Script["type"]) => {
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

  const getScriptTypeColor = (type: Script["type"]) => {
    switch (type) {
      case "call":
        return "bg-blue-50 text-blue-700"
      case "email":
        return "bg-accent/10 text-accent"
      case "value-points":
        return "bg-chart-1/10 text-chart-1"
      case "questions":
        return "bg-chart-2/10 text-chart-2"
    }
  }

  const handleSaveScript = () => {
    if (editingScript) {
      setScripts(scripts.map((s) => (s.id === editingScript.id ? editingScript : s)))
      setEditingScript(null)
    }
  }

  const handleDeleteScript = (scriptId: string) => {
    setScripts(scripts.filter((s) => s.id !== scriptId))
  }

  return (
    <div className="p-8 space-y-8" style={{ backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">My Scripts</h1>
          <p className="text-muted-foreground">AI-generated sales scripts and templates</p>
        </div>
        <Dialog open={isGenerating} onOpenChange={setIsGenerating}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Generate New Script
            </Button>
          </DialogTrigger>
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
                    onChange={(e) => setAiForm({ ...aiForm, scriptType: e.target.value as Script["type"] })}
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

      {/* Scripts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scripts
          .filter((script) => script.isAIGenerated)
          .map((script, index) => {
            const Icon = getScriptIcon(script.type)
            const isEditing = editingScript?.id === script.id

            return (
              <Card
                key={script.id}
                className="bg-white hover:shadow-lg transition-shadow duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      {isEditing ? (
                        <Input
                          value={editingScript.title}
                          onChange={(e) => setEditingScript({ ...editingScript, title: e.target.value })}
                          className="font-semibold"
                        />
                      ) : (
                        <CardTitle className="text-lg">{script.title}</CardTitle>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge className={getScriptTypeColor(script.type)}>
                          <Icon className="h-3 w-3 mr-1" />
                          {getScriptTypeLabel(script.type)}
                        </Badge>
                        <Badge className="bg-purple-50 text-purple-700">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI Generated
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(script.dateCreated).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button size="sm" onClick={handleSaveScript} className="gap-1">
                            <Save className="h-3 w-3" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingScript(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingScript(script)}
                            className="gap-1 bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteScript(script.id)}
                            className="gap-1 bg-transparent border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editingScript.content}
                      onChange={(e) => setEditingScript({ ...editingScript, content: e.target.value })}
                      className="min-h-32"
                    />
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <pre className="text-sm whitespace-pre-wrap font-sans text-foreground">{script.content}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
      </div>

      {scripts.filter((script) => script.isAIGenerated).length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No AI scripts yet</h3>
          <p className="text-muted-foreground mb-4">Generate your first AI-powered script to get started</p>
          <Button onClick={() => setIsGenerating(true)} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Script
          </Button>
        </div>
      )}
    </div>
  )
}
