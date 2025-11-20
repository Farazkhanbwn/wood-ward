"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  Eye,
  Download,
  Calendar,
  FileText,
  Phone,
  Mail,
  HelpCircle,
  Sparkles,
  Save,
  RotateCcw,
} from "lucide-react"

interface CampaignKit {
  id: string
  title: string
  description: string
  dateCreated: string
  industry: string
  callScript: string
  voicemailScript: string
  emailTemplate: string
  discoveryFramework: string[]
}

interface CampaignKitForm {
  productService: string
  targetPersona: string
  industry: string
  callObjective: string
  additionalContext: string
}

interface CampaignKitsTabProps {
  onNavigate?: (tab: string) => void
}

export function CampaignKitsTab({ onNavigate }: CampaignKitsTabProps) {
  const [campaignKits, setCampaignKits] = useState<CampaignKit[]>(() => {
    const savedKits = localStorage.getItem("campaignKits")
    const generatedKits = savedKits ? JSON.parse(savedKits) : []

    const defaultKits = [
      {
        id: "1",
        title: "SaaS Cold Outreach Kit",
        description: "Complete campaign for reaching out to SaaS decision makers",
        dateCreated: "2024-01-20",
        industry: "Technology",
        callScript:
          "Hi [Name], this is [Your Name] from [Company]. I know you're busy running [Their Company], so I'll be brief.\\n\\nI noticed you're using [Current Tool] for [Process]. We've helped similar SaaS companies like [Similar Company] reduce their [Pain Point] by 40% while increasing [Benefit] by 60%.\\n\\nI'd love to show you how we did it. Do you have 15 minutes this week for a quick call?",
        voicemailScript:
          "Hi [Name], this is [Your Name] from [Company]. I'm calling because I noticed [Their Company] is growing rapidly in the [Industry] space.\\n\\nWe've helped companies like [Similar Company] scale their [Process] without adding headcount. I'd love to share how we did it.\\n\\nI'll send you a quick email with a case study. My number is [Phone]. Thanks!",
        emailTemplate:
          "Subject: How [Similar Company] scaled without adding headcount\\n\\nHi [Name],\\n\\nI noticed [Their Company] has been growing rapidly - congratulations on the recent [Achievement/News]!\\n\\nI'm reaching out because we recently helped [Similar Company] solve a challenge that might sound familiar: scaling [Process] without constantly adding new team members.\\n\\nThe result? They reduced [Pain Point] by 40% and increased [Benefit] by 60% in just 3 months.\\n\\nI'd love to show you exactly how we did it. Are you available for a 15-minute call this week?\\n\\nBest regards,\\n[Your Name]",
        discoveryFramework: [
          "What's your current process for [Relevant Process]?",
          "How much time does your team spend on [Specific Task] each week?",
          "What challenges are you facing as you scale [Process]?",
          "How are you currently measuring [Relevant Metric]?",
          "What would solving this problem mean for your business?",
          "Who else would be involved in evaluating a solution like this?",
          "What's your timeline for addressing this challenge?",
        ],
      },
      {
        id: "2",
        title: "E-commerce Growth Kit",
        description: "Targeted campaign for e-commerce businesses looking to scale",
        dateCreated: "2024-01-18",
        industry: "E-commerce",
        callScript:
          "Hi [Name], this is [Your Name] from [Company]. I'm calling because I saw [Their Company] is doing some impressive things in the [Product Category] space.\\n\\nWe work with e-commerce brands like [Similar Company] to increase their conversion rates and average order value. In fact, we helped them increase revenue by 35% in just 4 months.\\n\\nI'd love to share what we learned. Do you have a few minutes to chat?",
        voicemailScript:
          "Hi [Name], [Your Name] here from [Company]. I'm calling about [Their Company]'s growth in the [Product Category] market.\\n\\nWe recently helped [Similar Company] increase their conversion rate by 25% and boost average order value by 40%. I think there might be some strategies that could work for [Their Company] too.\\n\\nI'll follow up with an email containing the case study. Talk soon!",
        emailTemplate:
          "Subject: How [Similar Company] increased revenue by 35%\\n\\nHi [Name],\\n\\nI've been following [Their Company]'s growth in the [Product Category] space - really impressive work!\\n\\nI'm reaching out because we recently worked with [Similar Company], another [Product Category] brand, to optimize their customer journey and increase conversions.\\n\\nThe results:\\n• 25% increase in conversion rate\\n• 40% boost in average order value\\n• 35% overall revenue growth\\n\\nI'd love to share the specific strategies we used. Would you be interested in a 15-minute call to discuss?\\n\\nBest,\\n[Your Name]",
        discoveryFramework: [
          "What's your current conversion rate?",
          "What's your average order value?",
          "What's your biggest challenge with customer acquisition?",
          "How do you currently handle cart abandonment?",
          "What tools are you using for analytics and optimization?",
          "What's your customer lifetime value?",
          "What's your target for growth this year?",
        ],
      },
      {
        id: "3",
        title: "Professional Services Kit",
        description: "Campaign designed for consulting and professional service firms",
        dateCreated: "2024-01-15",
        industry: "Professional Services",
        callScript:
          "Hi [Name], this is [Your Name] from [Company]. I'm calling because I noticed [Their Company] has been expanding their [Service Area] practice.\\n\\nWe work with professional service firms like [Similar Company] to streamline their client acquisition and project delivery processes. We helped them increase their project margins by 30% while reducing delivery time by 25%.\\n\\nI'd love to share how we did it. Do you have 10 minutes for a quick conversation?",
        voicemailScript:
          "Hi [Name], this is [Your Name] from [Company]. I'm calling about [Their Company]'s growth in [Service Area].\\n\\nWe recently helped [Similar Company] increase their project margins by 30% and reduce delivery time by 25%. I think some of these strategies could benefit [Their Company] as well.\\n\\nI'll send you a detailed case study via email. Looking forward to connecting!",
        emailTemplate:
          "Subject: How [Similar Company] increased margins by 30%\\n\\nHi [Name],\\n\\nI hope this email finds you well. I've been following [Their Company]'s expansion in the [Service Area] market.\\n\\nI'm reaching out because we recently partnered with [Similar Company], a [Service Type] firm similar to yours, to optimize their operations and client delivery.\\n\\nThe results were significant:\\n• 30% increase in project margins\\n• 25% reduction in delivery time\\n• 40% improvement in client satisfaction scores\\n\\nI'd be happy to share the specific strategies we implemented. Would you be open to a brief 15-minute call this week?\\n\\nBest regards,\\n[Your Name]",
        discoveryFramework: [
          "What's your current project margin?",
          "How long does your typical project take from start to finish?",
          "What's your biggest operational challenge?",
          "How do you currently manage client communications?",
          "What tools do you use for project management?",
          "How do you measure client satisfaction?",
          "What are your growth goals for this year?",
        ],
      },
    ]

    return [...generatedKits, ...defaultKits]
  })

  const [selectedKit, setSelectedKit] = useState<CampaignKit | null>(null)

  const [isGeneratingKit, setIsGeneratingKit] = useState(false)
  const [generatedKit, setGeneratedKit] = useState<any>(null)
  const [kitForm, setKitForm] = useState<CampaignKitForm>({
    productService: "",
    targetPersona: "",
    industry: "",
    callObjective: "",
    additionalContext: "",
  })

  const handleExportKit = (kit: CampaignKit) => {
    const content =
      `Campaign Kit: ${kit.title}\\n\\n` +
      `CALL SCRIPT:\\n${kit.callScript}\\n\\n` +
      `VOICEMAIL SCRIPT:\\n${kit.voicemailScript}\\n\\n` +
      `EMAIL TEMPLATE:\\n${kit.emailTemplate}\\n\\n` +
      `DISCOVERY QUESTIONS:\\n${kit.discoveryFramework.map((q) => `• ${q}`).join("\\n")}`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${kit.title.replace(/\\s+/g, "_")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateCampaignKit = async () => {
    console.log("[v0] Generating AI campaign kit with form data:", kitForm)

    const mockKit = {
      id: Date.now().toString(),
      title: `${kitForm.productService} - ${kitForm.targetPersona} Kit`,
      description: `Complete campaign for ${kitForm.targetPersona} in ${kitForm.industry}`,
      dateCreated: new Date().toISOString().split("T")[0],
      industry: kitForm.industry,
      callScript: `Hi [Name], this is [Your Name] from [Company]. I specialize in helping ${kitForm.targetPersona} with ${kitForm.productService}.

I know you're busy, so I'll be brief. ${kitForm.additionalContext ? kitForm.additionalContext + " " : ""}

We recently helped [Similar Company] achieve ${kitForm.callObjective}. I'd love to show you exactly how we did it.

Do you have 15 minutes this week for a quick call to discuss how this could work for [Their Company]?`,

      voicemailScript: `Hi [Name], this is [Your Name] from [Company]. I'm calling because I help ${kitForm.targetPersona} with ${kitForm.productService}.

${kitForm.additionalContext ? kitForm.additionalContext + " " : ""}We recently helped a company similar to yours achieve ${kitForm.callObjective}.

I'll send you a quick email with more details. My number is [Phone]. Thanks!`,

      emailTemplate: `Subject: How we helped [Similar Company] achieve ${kitForm.callObjective}

Hi [Name],

I hope this email finds you well. I'm reaching out because I help ${kitForm.targetPersona} in the ${kitForm.industry} industry with ${kitForm.productService}.

${kitForm.additionalContext}

We recently worked with [Similar Company] and helped them achieve ${kitForm.callObjective}. The results were impressive and I think there might be some strategies that could benefit [Their Company] as well.

I'd love to share the specific approach we used. Would you be open to a brief 15-minute call this week?

Best regards,
[Your Name]`,

      discoveryFramework: [
        `What's your current approach to ${kitForm.productService.toLowerCase()}?`,
        `What challenges are you facing with ${kitForm.callObjective.toLowerCase()}?`,
        `How important is ${kitForm.callObjective.toLowerCase()} to your business goals?`,
        `What tools or solutions are you currently using?`,
        `What would success look like for you in this area?`,
        `Who else would be involved in evaluating a solution?`,
        `What's your timeline for addressing this challenge?`,
      ],
    }

    setTimeout(() => {
      setGeneratedKit(mockKit)
    }, 2000)
  }

  const saveGeneratedKit = () => {
    if (generatedKit) {
      const existingKits = JSON.parse(localStorage.getItem("campaignKits") || "[]")
      localStorage.setItem("campaignKits", JSON.stringify([generatedKit, ...existingKits]))
      setCampaignKits([generatedKit, ...campaignKits])

      setGeneratedKit(null)
      setKitForm({ productService: "", targetPersona: "", industry: "", callObjective: "", additionalContext: "" })
      setIsGeneratingKit(false)
    }
  }

  const discardGeneratedKit = () => {
    setGeneratedKit(null)
    setKitForm({ productService: "", targetPersona: "", industry: "", callObjective: "", additionalContext: "" })
  }

  const getIndustryColor = (industry: string) => {
    switch (industry.toLowerCase()) {
      case "technology":
        return "bg-blue-50 text-blue-700"
      case "e-commerce":
        return "bg-accent/10 text-accent"
      case "professional services":
        return "bg-chart-1/10 text-chart-1"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-8 space-y-8" style={{ backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Campaign Kits</h1>
          <p className="text-muted-foreground">Complete sales campaigns with scripts, emails, and frameworks</p>
        </div>
        <Dialog open={isGeneratingKit} onOpenChange={setIsGeneratingKit}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Package className="h-5 w-5" />
              New Campaign Kit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate AI Campaign Kit</DialogTitle>
              <DialogDescription>
                Create a complete campaign with call scripts, emails, voicemail scripts, and discovery questions
              </DialogDescription>
            </DialogHeader>

            {!generatedKit ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product / Service Name</label>
                  <Input
                    placeholder="e.g., CRM Software, Marketing Automation, Consulting Services"
                    value={kitForm.productService}
                    onChange={(e) => setKitForm({ ...kitForm, productService: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Persona</label>
                  <Input
                    placeholder="e.g., Small Business Owners, Marketing Directors, CTOs"
                    value={kitForm.targetPersona}
                    onChange={(e) => setKitForm({ ...kitForm, targetPersona: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry</label>
                  <select
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={kitForm.industry}
                    onChange={(e) => setKitForm({ ...kitForm, industry: e.target.value })}
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Education">Education</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Call Objective</label>
                  <Input
                    placeholder="e.g., increase sales by 30%, reduce costs by 25%, improve efficiency"
                    value={kitForm.callObjective}
                    onChange={(e) => setKitForm({ ...kitForm, callObjective: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Additional Context / Value Points</label>
                  <Textarea
                    placeholder="Any specific benefits, features, or context you want to include in the campaign..."
                    value={kitForm.additionalContext}
                    onChange={(e) => setKitForm({ ...kitForm, additionalContext: e.target.value })}
                    className="min-h-24"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsGeneratingKit(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={generateCampaignKit}
                    disabled={
                      !kitForm.productService || !kitForm.targetPersona || !kitForm.industry || !kitForm.callObjective
                    }
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Campaign Kit
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <h4 className="font-medium mb-2">Generated Campaign Kit: {generatedKit.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{generatedKit.description}</p>

                  <Tabs defaultValue="call-script" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="call-script" className="gap-2">
                        <Phone className="h-3 w-3" />
                        Call Script
                      </TabsTrigger>
                      <TabsTrigger value="voicemail" className="gap-2">
                        <Phone className="h-3 w-3" />
                        Voicemail
                      </TabsTrigger>
                      <TabsTrigger value="email" className="gap-2">
                        <Mail className="h-3 w-3" />
                        Email
                      </TabsTrigger>
                      <TabsTrigger value="discovery" className="gap-2">
                        <HelpCircle className="h-3 w-3" />
                        Discovery
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="call-script" className="space-y-2">
                      <div className="bg-background rounded p-3 border">
                        <pre className="text-sm whitespace-pre-wrap font-sans text-foreground">
                          {generatedKit.callScript}
                        </pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="voicemail" className="space-y-2">
                      <div className="bg-background rounded p-3 border">
                        <pre className="text-sm whitespace-pre-wrap font-sans text-foreground">
                          {generatedKit.voicemailScript}
                        </pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="email" className="space-y-2">
                      <div className="bg-background rounded p-3 border">
                        <pre className="text-sm whitespace-pre-wrap font-sans text-foreground">
                          {generatedKit.emailTemplate}
                        </pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="discovery" className="space-y-2">
                      <div className="bg-background rounded p-3 border">
                        <ul className="space-y-1">
                          {generatedKit.discoveryFramework.map((question: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                              {question}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={discardGeneratedKit}>
                    Discard
                  </Button>
                  <Button variant="outline" onClick={() => setGeneratedKit(null)} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button onClick={saveGeneratedKit} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Campaign Kit
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="animate-fade-in bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Kits</p>
                <p className="text-xl font-bold">{campaignKits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in bg-white" style={{ animationDelay: "0.1s" }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <FileText className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Industries</p>
                <p className="text-xl font-bold">{new Set(campaignKits.map((k) => k.industry)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in bg-white" style={{ animationDelay: "0.2s" }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-1/10 rounded-lg">
                <Download className="h-4 w-4 text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Downloads</p>
                <p className="text-xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Kits Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaignKits.map((kit, index) => (
          <Card
            key={kit.id}
            className="hover:shadow-lg transition-shadow duration-200 animate-slide-in bg-white"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{kit.title}</CardTitle>
                  <CardDescription>{kit.description}</CardDescription>
                  <div className="flex items-center gap-2">
                    <Badge className={getIndustryColor(kit.industry)}>{kit.industry}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(kit.dateCreated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Kit Components Preview */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Phone className="h-3 w-3 text-blue-700" />
                  <span>Call Script</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Phone className="h-3 w-3 text-accent" />
                  <span>Voicemail</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Mail className="h-3 w-3 text-chart-1" />
                  <span>Email Template</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <HelpCircle className="h-3 w-3 text-chart-2" />
                  <span>Discovery ({kit.discoveryFramework.length})</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedKit(kit)}
                  className="flex-1 gap-2 bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Eye className="h-3 w-3" />
                  View Kit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportKit(kit)}
                  className="flex-1 gap-2 bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Download className="h-3 w-3" />
                  Export Kit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaignKits.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No campaign kits yet</h3>
          <p className="text-muted-foreground mb-4">Get started with the existing campaign kits</p>
        </div>
      )}

      {/* Kit Detail Modal */}
      <Dialog open={!!selectedKit} onOpenChange={() => setSelectedKit(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {selectedKit?.title}
            </DialogTitle>
            <DialogDescription>{selectedKit?.description}</DialogDescription>
          </DialogHeader>
          {selectedKit && (
            <Tabs defaultValue="call-script" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="call-script" className="gap-2">
                  <Phone className="h-3 w-3" />
                  Call Script
                </TabsTrigger>
                <TabsTrigger value="voicemail" className="gap-2">
                  <Phone className="h-3 w-3" />
                  Voicemail
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="h-3 w-3" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="discovery" className="gap-2">
                  <HelpCircle className="h-3 w-3" />
                  Discovery
                </TabsTrigger>
              </TabsList>

              <TabsContent value="call-script" className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Call Script</h4>
                  <pre className="text-sm whitespace-pre-wrap font-sans text-foreground">{selectedKit.callScript}</pre>
                </div>
              </TabsContent>

              <TabsContent value="voicemail" className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Voicemail Script</h4>
                  <pre className="text-sm whitespace-pre-wrap font-sans text-foreground">
                    {selectedKit.voicemailScript}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Email Template</h4>
                  <pre className="text-sm whitespace-pre-wrap font-sans text-foreground">
                    {selectedKit.emailTemplate}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="discovery" className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Discovery Framework</h4>
                  <ul className="space-y-2">
                    {selectedKit.discoveryFramework.map((question, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-700 rounded-full mt-2 flex-shrink-0" />
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setSelectedKit(null)}>
              Close
            </Button>
            {selectedKit && (
              <Button onClick={() => handleExportKit(selectedKit)} className="gap-2">
                <Download className="h-4 w-4" />
                Export Kit
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
