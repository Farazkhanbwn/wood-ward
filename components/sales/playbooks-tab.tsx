"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useDialog } from "@/hooks"
import { Stepper } from "./Stepper"
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  Users,
  Package,
  AlertCircle,
  FileText,
  BookOpen,
  Plus,
  Mail,
  Voicemail,
  MessageSquare,
  Edit,
  Save,
  Download,
  Eye,
  Trash2,
  Calendar,
  Play,
  CheckCircle2,
} from "lucide-react"

interface PlaybooksTabProps {
  onNavigate?: (tab: string) => void
  startInCreateMode?: boolean
  initialPlaybookId?: string
}

interface PlaybookFormData {
  idealProspect: {
    profile: string
    websiteLinks: string[]
  }
  idealCustomer: {
    decisionMaker: string
    jobTitles: string
    nightWorries: string
    fears: string
    dailyFrustrations: string
  }
  differentiators: string
  other: {
    coldEmailExamples: string
    salesCollateral: string
  }
  qualificationQuestions: string // Added qualification questions field
  valueInStoryForm: {
    customerOutcomes: string
    outcomeExamples: string
  }
  notes: string
}

interface Recording {
  id: string
  title: string
  date: string
  lastEdited: string
  duration: string
  size: string
  score?: number
}

const steps = [
  { id: 1, title: "Ideal Prospect", icon: Users, description: "Map your ideal prospect" },
  { id: 2, title: "Ideal Customer", icon: Users, description: "Define your ideal customer" },
  { id: 3, title: "Differentiators", icon: Package, description: "Define your competitive advantages" },
  { id: 4, title: "Other...", icon: FileText, description: "Additional materials and templates" },
  { id: 5, title: "Qualification Questions", icon: MessageSquare, description: "Define your discovery questions" },
  { id: 6, title: "Value in Story Form™", icon: BookOpen, description: "Document customer success stories" },
  { id: 7, title: "Notes & Generate", icon: FileText, description: "Add notes and create playbook" }, // Renumbered from 11 to 7
]

export function PlaybooksTab({ onNavigate, startInCreateMode = false, initialPlaybookId }: PlaybooksTabProps) {
  const { showConfirm } = useDialog()
  const router = useRouter()
  const [view, setView] = useState<"list" | "create" | "generated">(startInCreateMode ? "create" : "list")
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isViewingExisting, setIsViewingExisting] = useState(false)
  const [formData, setFormData] = useState<PlaybookFormData>({
    idealProspect: {
      profile: "",
      websiteLinks: ["", "", ""],
    },
    idealCustomer: {
      decisionMaker: "",
      jobTitles: "",
      nightWorries: "",
      fears: "",
      dailyFrustrations: "",
    },
    differentiators: "",
    other: {
      coldEmailExamples: "",
      salesCollateral: "",
    },
    qualificationQuestions: "", // Added qualification questions to initial state
    valueInStoryForm: {
      customerOutcomes: "",
      outcomeExamples: "",
    },
    notes: "",
  })

  const queryClient = useQueryClient()
  const [generatedPlaybook, setGeneratedPlaybook] = useState<any>(null)
  const [editablePlaybook, setEditablePlaybook] = useState<any>(null)
  const [currentPlaybookId, setCurrentPlaybookId] = useState<string | null>(null)

  const { data: playbooksData, isLoading: isLoadingPlaybooks } = useQuery({
    queryKey: ['playbooks'],
    queryFn: async () => {
      const response = await api.getPlaybooks()
      if (response.success) {
        return response.playbooks.map((pb: any) => ({
          id: pb._id,
          title: pb.title || 'Untitled Playbook',
          date: pb.createdAt || new Date().toISOString(),
          lastEdited: pb.updatedAt || pb.createdAt || new Date().toISOString(),
          duration: "N/A",
          size: "N/A",
        }))
      }
      return []
    },
    staleTime: 0,
    gcTime: 0,
  })

  const playbooks = Array.isArray(playbooksData) ? playbooksData : []

  useEffect(() => {
    if (startInCreateMode) {
      setView("create")
    } else if (initialPlaybookId) {
      // Load the specific playbook and show the generated view
      handleViewPlaybook(initialPlaybookId)
    } else {
      // Reset to list view when no special mode is active
      setView("list")
    }
  }, [startInCreateMode, initialPlaybookId])

  const updateFormData = (section: keyof PlaybookFormData, field: string, value: string) => {
    if (typeof formData[section] === "object" && formData[section] !== null) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [section]: value,
      }))
    }
  }

  const updateWebsiteLink = (index: number, value: string) => {
    setFormData((prev) => {
      const newLinks = [...prev.idealProspect.websiteLinks]
      newLinks[index] = value
      return {
        ...prev,
        idealProspect: {
          ...prev.idealProspect,
          websiteLinks: newLinks,
        },
      }
    })
  }

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGeneratePlaybook = async () => {
    setIsGenerating(true)

    try {
      // Transform frontend data to API format
      const apiPayload = {
        ideal_prospect: {
          company_profile: formData.idealProspect.profile,
          website_links: formData.idealProspect.websiteLinks.filter(link => link.trim())
        },
        ideal_customer: {
          decision_maker: formData.idealCustomer.decisionMaker,
          job_titles_roles: formData.idealCustomer.jobTitles,
          keeps_awake: formData.idealCustomer.nightWorries,
          fears: formData.idealCustomer.fears,
          daily_frustrations: formData.idealCustomer.dailyFrustrations
            .split('\n')
            .map(f => f.trim())
            .filter(f => f)
        },
        differentiators: {
          unique_points: formData.differentiators
            .split('\n')
            .map(d => d.trim())
            .filter(d => d)
        },
        other_info: {
          cold_email_examples: formData.other.coldEmailExamples
            .split('\n\n')
            .map(e => e.trim())
            .filter(e => e),
          sales_collateral: formData.other.salesCollateral
        },
        qualification_questions: {
          questions: formData.qualificationQuestions
            .split('\n')
            .map(q => q.trim())
            .filter(q => q)
        },
        value_stories: {
          customer_outcomes_search: formData.valueInStoryForm.customerOutcomes,
          customer_outcome_examples: formData.valueInStoryForm.outcomeExamples
            .split('\n\n')
            .map(e => e.trim())
            .filter(e => e)
        },
        additional_notes: formData.notes
      }

      const response = await api.generatePlaybookContent(apiPayload)
      const playbook = response.generated_playbook
      
      // Convert objection_handling object to array format
      let objectionHandling = []
      if (playbook.call_script?.objection_handling) {
        if (Array.isArray(playbook.call_script.objection_handling)) {
          objectionHandling = playbook.call_script.objection_handling
        } else if (typeof playbook.call_script.objection_handling === 'object') {
          objectionHandling = Object.entries(playbook.call_script.objection_handling).map(([objection, response]) => ({
            objection,
            response: response as string
          }))
        }
      }
      
      // Clean up JSON wrapper if present
      const cleanText = (text: string) => {
        if (!text) return ''
        return text.replace(/^```json\s*\{?\s*"\w+":\s*"/i, '').replace(/"?\s*\}?\s*```$/i, '').trim()
      }
      
      const generated = {
        callScript: {
          openingLine: cleanText(playbook.call_script?.opening_line || ''),
          discoveryQuestions: Array.isArray(playbook.call_script?.discovery_questions) 
            ? playbook.call_script.discovery_questions 
            : [],
          objectionHandling,
          closingStatement: cleanText(playbook.call_script?.closing_statement || ''),
        },
        emailTemplates: {
          coldOutreach: cleanText(playbook.email_templates?.cold_outreach || ''),
          followUp: cleanText(playbook.email_templates?.follow_up || ''),
        },
        voicemailScript: cleanText(playbook.voicemail_script || ''),
        discoveryFramework: {
          openEndedQuestions: Array.isArray(playbook.discovery_framework?.open_ended_questions) 
            ? playbook.discovery_framework.open_ended_questions 
            : [],
          keyValuePoints: Array.isArray(playbook.discovery_framework?.key_value_points) 
            ? playbook.discovery_framework.key_value_points 
            : [],
        },
        valueInStoryForm: {
          customerOutcomes: formData.valueInStoryForm.customerOutcomes,
          outcomeExamples: formData.valueInStoryForm.outcomeExamples,
        },
      }

      setGeneratedPlaybook(generated)
      setEditablePlaybook(JSON.parse(JSON.stringify(generated)))
      setIsViewingExisting(false)
      setView("generated")
    } catch (error) {
      console.error('Failed to generate playbook:', error)
      toast.error('Failed to generate playbook. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - revert to original
      setEditablePlaybook(JSON.parse(JSON.stringify(generatedPlaybook)))
    }
    setIsEditing(!isEditing)
  }

  const handleSavePlaybook = async () => {
    try {
      if (isViewingExisting && currentPlaybookId) {
        // Update existing playbook
        const response = await api.updatePlaybook(currentPlaybookId, {
          generatedContent: editablePlaybook
        })
        if (response.success) {
          setGeneratedPlaybook(JSON.parse(JSON.stringify(editablePlaybook)))
          setIsEditing(false)
          toast.success('Playbook updated successfully!')
        }
      } else {
        // Create new playbook
        const title = `Playbook - ${new Date().toLocaleDateString()}`
        const response = await api.createPlaybook({
          title,
          formData,
          generatedContent: editablePlaybook
        })
        if (response.success) {
          setCurrentPlaybookId(response.playbook._id)
          setIsViewingExisting(true)
          setGeneratedPlaybook(JSON.parse(JSON.stringify(editablePlaybook)))
          setIsEditing(false)
          toast.success('Playbook saved successfully!')
          queryClient.invalidateQueries({ queryKey: ['playbooks'] })
        }
      }
    } catch (error) {
      console.error('Failed to save playbook:', error)
      toast.error('Failed to save playbook')
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mapping Your Ideal Prospect</h3>
              <p className="text-gray-600 mb-6">Define the ideal companies/organizations you're targeting</p>

              <div className="space-y-5">
                {/* Question 1 Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <Label htmlFor="prospectProfile" className="text-base font-semibold text-gray-900 mb-3 block">
                    Q1: Profile the ideal prospect company/organization that you are selling to.
                  </Label>
                  <Textarea
                    id="prospectProfile"
                    placeholder="Type your answer here... Describe your ideal prospect company/organization (e.g., industry, size, characteristics, challenges they face, etc.)"
                    value={formData.idealProspect.profile}
                    onChange={(e) => updateFormData("idealProspect", "profile", e.target.value)}
                    rows={6}
                    className="bg-gray-50 border-gray-300 focus:bg-white"
                  />
                </div>

                {/* Question 2 Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <Label className="text-base font-semibold text-gray-900 mb-3 block">
                    Q2: Provide website links for 3 ideal prospect companies/organizations.
                  </Label>
                  <div className="space-y-3">
                    {[0, 1, 2].map((index) => (
                      <div key={index}>
                        <Label htmlFor={`website-${index}`} className="text-sm font-medium text-gray-700 mb-1.5 block">
                          Company {index + 1} Website
                        </Label>
                        <Input
                          id={`website-${index}`}
                          type="url"
                          placeholder="https://example.com"
                          value={formData.idealProspect.websiteLinks[index]}
                          onChange={(e) => updateWebsiteLink(index, e.target.value)}
                          className="bg-gray-50 border-gray-300 focus:bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mapping Your Ideal Customer</h3>
              <p className="text-gray-600 mb-6">Define the decision maker at your ideal prospect company</p>

              <div className="space-y-5">
                {/* Question 1 Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <Label htmlFor="decisionMaker" className="text-base font-semibold text-gray-900 mb-3 block">
                    Q1: At your ideal prospect company, who is your ideal customer (i.e. the decision maker and best
                    point of first contact)?
                  </Label>
                  <Textarea
                    id="decisionMaker"
                    placeholder="Type your answer here... Describe the ideal customer/decision maker (e.g., their role, responsibilities, authority level, etc.)"
                    value={formData.idealCustomer.decisionMaker}
                    onChange={(e) => updateFormData("idealCustomer", "decisionMaker", e.target.value)}
                    rows={4}
                    className="bg-gray-50 border-gray-300 focus:bg-white"
                  />
                </div>

                {/* Question 2 Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <Label htmlFor="jobTitles" className="text-base font-semibold text-gray-900 mb-3 block">
                    Q2: Job titles and role description.
                  </Label>
                  <Textarea
                    id="jobTitles"
                    placeholder="Type your answer here... List specific job titles and describe their role (e.g., VP of Sales, Director of Marketing, etc.)"
                    value={formData.idealCustomer.jobTitles}
                    onChange={(e) => updateFormData("idealCustomer", "jobTitles", e.target.value)}
                    rows={4}
                    className="bg-gray-50 border-gray-300 focus:bg-white"
                  />
                </div>

                {/* Question 3 Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <Label htmlFor="nightWorries" className="text-base font-semibold text-gray-900 mb-3 block">
                    Q3: What keeps them awake at night staring at the ceiling?
                  </Label>
                  <Textarea
                    id="nightWorries"
                    placeholder="Type your answer here... Describe their biggest worries and concerns that keep them up at night"
                    value={formData.idealCustomer.nightWorries}
                    onChange={(e) => updateFormData("idealCustomer", "nightWorries", e.target.value)}
                    rows={4}
                    className="bg-gray-50 border-gray-300 focus:bg-white"
                  />
                </div>

                {/* Question 4 Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <Label htmlFor="fears" className="text-base font-semibold text-gray-900 mb-3 block">
                    Q4: What are they afraid of?
                  </Label>
                  <Textarea
                    id="fears"
                    placeholder="Type your answer here... Describe their fears (e.g., losing their job, missing targets, falling behind competitors, etc.)"
                    value={formData.idealCustomer.fears}
                    onChange={(e) => updateFormData("idealCustomer", "fears", e.target.value)}
                    rows={4}
                    className="bg-gray-50 border-gray-300 focus:bg-white"
                  />
                </div>

                {/* Question 5 Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <Label htmlFor="dailyFrustrations" className="text-base font-semibold text-gray-900 mb-3 block">
                    Q5: What are their top 3 daily frustrations at work?
                  </Label>
                  <Textarea
                    id="dailyFrustrations"
                    placeholder="Type your answer here... List their top 3 daily frustrations (e.g., inefficient processes, lack of resources, difficult team dynamics, etc.)"
                    value={formData.idealCustomer.dailyFrustrations}
                    onChange={(e) => updateFormData("idealCustomer", "dailyFrustrations", e.target.value)}
                    rows={5}
                    className="bg-gray-50 border-gray-300 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mapping Your Differentiators</h3>
              <p className="text-gray-600 mb-6">Define what makes your product/service unique</p>

              <div className="space-y-5">
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <Label htmlFor="differentiators" className="text-base font-semibold text-gray-900 mb-3 block">
                    Q1: What makes your product/service different from competitors? List the points here.
                  </Label>
                  <Textarea
                    id="differentiators"
                    placeholder="Type your answer here... List your key differentiators and competitive advantages (e.g., unique features, pricing model, customer service, technology, etc.)"
                    value={formData.differentiators}
                    onChange={(e) => updateFormData("differentiators", "", e.target.value)}
                    rows={8}
                    className="bg-gray-50 border-gray-300 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Other...</h3>
              <p className="text-gray-600 mb-6">Provide additional materials to enhance your playbook</p>

              <div className="space-y-5">
                {/* Question 1 Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <Label htmlFor="coldEmailExamples" className="text-base font-semibold text-gray-900 mb-3 block">
                    Q1: Provide one or more examples of a cold email that you currently use or could use to prospect
                    with. Paste template(s) here....
                  </Label>
                  <Textarea
                    id="coldEmailExamples"
                    placeholder="Type your answer here... Paste your cold email template(s) here. You can include multiple examples separated by line breaks."
                    value={formData.other.coldEmailExamples}
                    onChange={(e) => updateFormData("other", "coldEmailExamples", e.target.value)}
                    rows={10}
                    className="bg-gray-50 border-gray-300 focus:bg-white font-mono text-sm"
                  />
                </div>

                {/* Question 2 Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <Label htmlFor="salesCollateral" className="text-base font-semibold text-gray-900 mb-3 block">
                    Q2: Upload or paste any additional sales collateral (sales decks, marketing materials), or any
                    relevant text about your company, product, or service.
                  </Label>
                  <Textarea
                    id="salesCollateral"
                    placeholder="Type your answer here... Paste any additional sales collateral, marketing materials, product descriptions, company information, or other relevant text here."
                    value={formData.other.salesCollateral}
                    onChange={(e) => updateFormData("other", "salesCollateral", e.target.value)}
                    rows={10}
                    className="bg-gray-50 border-gray-300 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualification Questions...</h3>
              <p className="text-gray-600 mb-6">Define open-ended questions to engage prospects</p>

              <div className="space-y-5">
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <Label htmlFor="qualificationQuestions" className="text-base font-semibold text-gray-900 mb-3 block">
                    Q1: List four or more open-ended qualification questions that you could ask a prospect to get them
                    talking.
                  </Label>
                  <Textarea
                    id="qualificationQuestions"
                    placeholder="Type your answer here... List your open-ended qualification questions here (e.g., 'Can you walk me through your current process?', 'What challenges are you facing with...?', etc.)"
                    value={formData.qualificationQuestions}
                    onChange={(e) => updateFormData("qualificationQuestions", "", e.target.value)}
                    rows={10}
                    className="bg-gray-50 border-gray-300 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Value in Story Form™...</h3>
              <p className="text-gray-600 mb-6">Document customer success stories and outcomes</p>

              <div className="space-y-5">
                {/* Question 1 Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <Label htmlFor="customerOutcomes" className="text-base font-semibold text-gray-900 mb-3 block">
                    Q1: Search for any customer outcomes that your company has (look through any company case studies,
                    on your company website, in customer testimonials, white papers, etc.)....
                  </Label>
                  <Textarea
                    id="customerOutcomes"
                    placeholder="Type your answer here... Paste or describe customer outcomes, case studies, testimonials, or success stories here..."
                    value={formData.valueInStoryForm.customerOutcomes}
                    onChange={(e) => updateFormData("valueInStoryForm", "customerOutcomes", e.target.value)}
                    rows={8}
                    className="bg-gray-50 border-gray-300 focus:bg-white"
                  />
                </div>

                {/* Question 2 Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <Label htmlFor="outcomeExamples" className="text-base font-semibold text-gray-900 mb-3 block">
                    Q2: Write three or more examples of customer outcomes in the following format.
                  </Label>
                  <Textarea
                    id="outcomeExamples"
                    placeholder="Type your answer here...&#10;&#10;Example format:&#10;Customer: [Company Name]&#10;Challenge: [What problem they faced]&#10;Solution: [How your product/service helped]&#10;Result: [Measurable outcome]&#10;&#10;Write 3+ examples following this format..."
                    value={formData.valueInStoryForm.outcomeExamples}
                    onChange={(e) => updateFormData("valueInStoryForm", "outcomeExamples", e.target.value)}
                    rows={12}
                    className="bg-gray-50 border-gray-300 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
              <p className="text-gray-600 mb-6">Any other context or specific requirements?</p>

              <div className="space-y-5">
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <Label htmlFor="notes" className="text-base font-semibold text-gray-900 mb-3 block">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Type your answer here... Add any custom notes, specific talking points, or special considerations..."
                    value={formData.notes}
                    onChange={(e) => updateFormData("notes", "", e.target.value)}
                    rows={6}
                    className="bg-gray-50 border-gray-300 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="text-center pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Your Sales Playbook</h3>
              <p className="text-gray-600 mb-6">
                Ready to create your personalized sales playbook with AI-generated scripts and templates?
              </p>

              {isGenerating ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Generating your playbook...</p>
                </div>
              ) : (
                <Button size="lg" onClick={handleGeneratePlaybook}>
                  Generate Playbook
                </Button>
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const handleViewPlaybook = async (playbookId: string) => {
    try {
      const response = await api.getPlaybookById(playbookId)
      if (response.success) {
        const playbook = response.playbook
        setCurrentPlaybookId(playbook._id)
        setFormData(playbook.formData)
        setGeneratedPlaybook(playbook.generatedContent)
        setEditablePlaybook(JSON.parse(JSON.stringify(playbook.generatedContent)))
        setIsViewingExisting(true)
        setView("generated")
      }
    } catch (error) {
      console.error('Failed to load playbook:', error)
      toast.error('Failed to load playbook')
    }
  }

  const handleExportPlaybook = async (format: 'pdf' | 'doc') => {
    if (!editablePlaybook || !currentPlaybookId) return

    try {
      if (format === 'pdf') {
        await exportToPDF()
      } else {
        await exportToDoc()
      }
      toast.success(`Playbook exported as ${format.toUpperCase()} successfully!`)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export playbook')
    }
  }

  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    let yPos = 20

    // Title
    doc.setFontSize(20)
    doc.text('Sales Playbook', 20, yPos)
    yPos += 15

    // Call Script
    doc.setFontSize(16)
    doc.text('Call Script', 20, yPos)
    yPos += 10
    doc.setFontSize(12)
    doc.text('Opening Line:', 20, yPos)
    yPos += 7
    doc.setFontSize(10)
    const openingLines = doc.splitTextToSize(editablePlaybook.callScript.openingLine, 170)
    doc.text(openingLines, 20, yPos)
    yPos += openingLines.length * 5 + 10

    // Discovery Questions
    if (yPos > 250) { doc.addPage(); yPos = 20 }
    doc.setFontSize(12)
    doc.text('Discovery Questions:', 20, yPos)
    yPos += 7
    doc.setFontSize(10)
    editablePlaybook.callScript.discoveryQuestions.forEach((q: string, i: number) => {
      if (yPos > 270) { doc.addPage(); yPos = 20 }
      const lines = doc.splitTextToSize(`${i + 1}. ${q}`, 170)
      doc.text(lines, 20, yPos)
      yPos += lines.length * 5 + 3
    })

    // Objection Handling
    if (yPos > 250) { doc.addPage(); yPos = 20 }
    yPos += 5
    doc.setFontSize(12)
    doc.text('Objection Handling:', 20, yPos)
    yPos += 7
    doc.setFontSize(10)
    editablePlaybook.callScript.objectionHandling.forEach((obj: any) => {
      if (yPos > 250) { doc.addPage(); yPos = 20 }
      const objLines = doc.splitTextToSize(`Objection: ${obj.objection}`, 170)
      doc.text(objLines, 20, yPos)
      yPos += objLines.length * 5 + 3
      const resLines = doc.splitTextToSize(`Response: ${obj.response}`, 170)
      doc.text(resLines, 20, yPos)
      yPos += resLines.length * 5 + 5
    })

    // Closing Statement
    if (yPos > 250) { doc.addPage(); yPos = 20 }
    yPos += 5
    doc.setFontSize(12)
    doc.text('Closing Statement:', 20, yPos)
    yPos += 7
    doc.setFontSize(10)
    const closingLines = doc.splitTextToSize(editablePlaybook.callScript.closingStatement, 170)
    doc.text(closingLines, 20, yPos)

    // Email Templates
    doc.addPage()
    yPos = 20
    doc.setFontSize(16)
    doc.text('Email Templates', 20, yPos)
    yPos += 10
    doc.setFontSize(12)
    doc.text('Cold Outreach:', 20, yPos)
    yPos += 7
    doc.setFontSize(10)
    const coldLines = doc.splitTextToSize(editablePlaybook.emailTemplates.coldOutreach, 170)
    doc.text(coldLines, 20, yPos)
    yPos += coldLines.length * 5 + 10

    if (yPos > 250) { doc.addPage(); yPos = 20 }
    doc.setFontSize(12)
    doc.text('Follow-up:', 20, yPos)
    yPos += 7
    doc.setFontSize(10)
    const followLines = doc.splitTextToSize(editablePlaybook.emailTemplates.followUp, 170)
    doc.text(followLines, 20, yPos)

    // Voicemail Script
    doc.addPage()
    yPos = 20
    doc.setFontSize(16)
    doc.text('Voicemail Script', 20, yPos)
    yPos += 10
    doc.setFontSize(10)
    const voicemailLines = doc.splitTextToSize(editablePlaybook.voicemailScript, 170)
    doc.text(voicemailLines, 20, yPos)

    // Discovery Framework
    doc.addPage()
    yPos = 20
    doc.setFontSize(16)
    doc.text('Discovery Framework', 20, yPos)
    yPos += 10
    doc.setFontSize(12)
    doc.text('Open-ended Questions:', 20, yPos)
    yPos += 7
    doc.setFontSize(10)
    editablePlaybook.discoveryFramework.openEndedQuestions.forEach((q: string) => {
      if (yPos > 270) { doc.addPage(); yPos = 20 }
      const lines = doc.splitTextToSize(`• ${q}`, 170)
      doc.text(lines, 20, yPos)
      yPos += lines.length * 5 + 3
    })

    if (yPos > 250) { doc.addPage(); yPos = 20 }
    yPos += 5
    doc.setFontSize(12)
    doc.text('Key Value Points:', 20, yPos)
    yPos += 7
    doc.setFontSize(10)
    editablePlaybook.discoveryFramework.keyValuePoints.forEach((point: string) => {
      if (yPos > 270) { doc.addPage(); yPos = 20 }
      const lines = doc.splitTextToSize(`• ${point}`, 170)
      doc.text(lines, 20, yPos)
      yPos += lines.length * 5 + 3
    })

    doc.save('playbook.pdf')
  }

  const exportToDoc = async () => {
    const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } = await import('docx')
    const fileSaverModule = await import('file-saver')
    const saveAs = fileSaverModule.default || fileSaverModule.saveAs

    const children: any[] = [
      new Paragraph({
        text: 'Sales Playbook',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'Call Script',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Opening Line:', bold: true })],
      }),
      new Paragraph({ text: editablePlaybook.callScript.openingLine }),
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [new TextRun({ text: 'Discovery Questions:', bold: true })],
      }),
    ]

    editablePlaybook.callScript.discoveryQuestions.forEach((q: string, i: number) => {
      children.push(new Paragraph({ text: `${i + 1}. ${q}` }))
    })

    children.push(
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [new TextRun({ text: 'Objection Handling:', bold: true })],
      })
    )

    editablePlaybook.callScript.objectionHandling.forEach((obj: any) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `Objection: ${obj.objection}`, italics: true })],
        }),
        new Paragraph({ text: `Response: ${obj.response}` }),
        new Paragraph({ text: '' })
      )
    })

    children.push(
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [new TextRun({ text: 'Closing Statement:', bold: true })],
      }),
      new Paragraph({ text: editablePlaybook.callScript.closingStatement }),
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'Email Templates',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Cold Outreach:', bold: true })],
      }),
      new Paragraph({ text: editablePlaybook.emailTemplates.coldOutreach }),
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [new TextRun({ text: 'Follow-up:', bold: true })],
      }),
      new Paragraph({ text: editablePlaybook.emailTemplates.followUp }),
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'Voicemail Script',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({ text: editablePlaybook.voicemailScript }),
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'Discovery Framework',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Open-ended Questions:', bold: true })],
      })
    )

    editablePlaybook.discoveryFramework.openEndedQuestions.forEach((q: string) => {
      children.push(new Paragraph({ text: `• ${q}` }))
    })

    children.push(
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [new TextRun({ text: 'Key Value Points:', bold: true })],
      })
    )

    editablePlaybook.discoveryFramework.keyValuePoints.forEach((point: string) => {
      children.push(new Paragraph({ text: `• ${point}` }))
    })

    const doc = new Document({
      sections: [{ children }],
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, 'playbook.docx')
  }

  const handleDeletePlaybook = async (playbookId: string) => {
    if (!playbookId || playbookId === 'undefined' || playbookId === 'null') {
      toast.error('Invalid playbook ID')
      return
    }
    
    const confirmed = await showConfirm({
      title: "Delete Playbook",
      message: "Are you sure you want to delete this playbook?",
      confirmText: "Delete",
      cancelText: "Cancel"
    })

    if (confirmed) {
      try {
        const response = await api.deletePlaybook(playbookId)
        if (response.success) {
          await queryClient.invalidateQueries({ queryKey: ['playbooks'] })
          await queryClient.refetchQueries({ queryKey: ['playbooks'] })
          toast.success('Playbook deleted successfully!')
        } else {
          toast.error(response.message || 'Failed to delete playbook')
        }
      } catch (error: any) {
        console.error('Failed to delete playbook:', error)
        toast.error(error?.message || 'Failed to delete playbook')
      }
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '...'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '...'
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (error) {
      return '...'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-blue-50 text-blue-700"
    if (score >= 80) return "bg-green-50 text-green-700"
    if (score >= 70) return "bg-yellow-50 text-yellow-700"
    return "bg-red-50 text-red-700"
  }

  const handleStartSimulation = (playbookId: string) => {
    // Navigate to call simulation tab
    // In the future, you could pass the playbook data to pre-populate the simulation
    onNavigate?.("call-simulation")
  }

  if (view === "generated" && generatedPlaybook && editablePlaybook) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8 pb-4 border-b">
          {/* Small devices: 3 rows */}
          <div className="sm:hidden space-y-4">
            {/* Row 1: Back button */}
            <div className="flex justify-start">
              <Button
                variant="ghost"
                onClick={() => {
                  setView("list")
                  setCurrentStep(1)
                  setIsEditing(false)
                  setIsViewingExisting(false)
                  setGeneratedPlaybook(null)
                  setEditablePlaybook(null)
                  setCurrentPlaybookId(null)
                  router.push("/sales/playbooks")
                }}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Playbooks
              </Button>
            </div>

            {/* Row 2: Title */}
            <div className="flex justify-center">
              <h1 className="text-2xl font-bold text-gray-900">Your Sales Playbook</h1>
            </div>

            {/* Row 3: Action buttons with equal spacing */}
            <div className="flex gap-2">
              <Button variant={isEditing ? "default" : "outline"} size="sm" onClick={handleEditToggle} className="gap-2 flex-1">
                <Edit className="w-4 h-4" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSavePlaybook}
                className="gap-2 bg-transparent flex-1"
              >
                <Save className="w-4 h-4" />
                <span className="sm:hidden">Save</span>
                <span className="hidden sm:inline">{isViewingExisting ? "Save Changes" : "Save to Playbook"}</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent flex-1">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExportPlaybook('pdf')}>
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportPlaybook('doc')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Doc
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Medium devices: 2 rows */}
          <div className="hidden sm:block lg:hidden space-y-4">
            {/* Row 1: Back button */}
            <div className="flex justify-start">
              <Button
                variant="ghost"
                onClick={() => {
                  setView("list")
                  setCurrentStep(1)
                  setIsEditing(false)
                  setIsViewingExisting(false)
                  setGeneratedPlaybook(null)
                  setEditablePlaybook(null)
                  setCurrentPlaybookId(null)
                  router.push("/sales/playbooks")
                }}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Playbooks
              </Button>
            </div>

            {/* Row 2: Title and actions with justify-between */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Your Sales Playbook</h1>

              <div className="flex gap-2">
                <Button variant={isEditing ? "default" : "outline"} size="sm" onClick={handleEditToggle} className="gap-2">
                  <Edit className="w-4 h-4" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSavePlaybook}
                  className="gap-2 bg-transparent"
                >
                  <Save className="w-4 h-4" />
                  {isViewingExisting ? "Save Changes" : "Save to Playbook"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExportPlaybook('pdf')}>
                      <FileText className="w-4 h-4 mr-2" />
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportPlaybook('doc')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Doc
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Large devices: All in one row */}
          <div className="hidden lg:flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                setView("list")
                setCurrentStep(1)
                setIsEditing(false)
                setIsViewingExisting(false)
                setGeneratedPlaybook(null)
                setEditablePlaybook(null)
                setCurrentPlaybookId(null)
                router.push("/sales/playbooks")
              }}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Playbooks
            </Button>

            <h1 className="text-2xl font-bold text-gray-900">Your Sales Playbook</h1>

            <div className="flex gap-2">
              <Button variant={isEditing ? "default" : "outline"} size="sm" onClick={handleEditToggle} className="gap-2">
                <Edit className="w-4 h-4" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSavePlaybook}
                className="gap-2 bg-transparent"
              >
                <Save className="w-4 h-4" />
                {isViewingExisting ? "Save Changes" : "Save to Playbook"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExportPlaybook('pdf')}>
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportPlaybook('doc')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Doc
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Call Script Section */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-md">
                <Phone className="w-5 h-5 text-primary" />
                Call Script
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Opening Line
                </h4>
                {isEditing ? (
                  <Textarea
                    value={editablePlaybook.callScript.openingLine}
                    onChange={(e) =>
                      setEditablePlaybook({
                        ...editablePlaybook,
                        callScript: { ...editablePlaybook.callScript, openingLine: e.target.value },
                      })
                    }
                    rows={3}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{editablePlaybook.callScript.openingLine}</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Discovery Questions
                </h4>
                <ul className="space-y-3">
                  {editablePlaybook.callScript.discoveryQuestions.map((q: string, i: number) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-primary font-semibold">{i + 1}.</span>
                      {isEditing ? (
                        <Textarea
                          value={q}
                          onChange={(e) => {
                            const newQuestions = [...editablePlaybook.callScript.discoveryQuestions]
                            newQuestions[i] = e.target.value
                            setEditablePlaybook({
                              ...editablePlaybook,
                              callScript: { ...editablePlaybook.callScript, discoveryQuestions: newQuestions },
                            })
                          }}
                          rows={2}
                          className="flex-1"
                        />
                      ) : (
                        <span className="text-gray-700 flex-1">{q}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  Objection Handling
                </h4>
                <div className="space-y-4">
                  {editablePlaybook.callScript.objectionHandling.map((obj: any, i: number) => (
                    <div key={i} className="bg-orange-50 p-4 rounded-lg space-y-2">
                      {isEditing ? (
                        <>
                          <Input
                            value={obj.objection}
                            onChange={(e) => {
                              const newObjections = [...editablePlaybook.callScript.objectionHandling]
                              newObjections[i].objection = e.target.value
                              setEditablePlaybook({
                                ...editablePlaybook,
                                callScript: { ...editablePlaybook.callScript, objectionHandling: newObjections },
                              })
                            }}
                            placeholder="Objection"
                            className="font-medium"
                          />
                          <Textarea
                            value={obj.response}
                            onChange={(e) => {
                              const newObjections = [...editablePlaybook.callScript.objectionHandling]
                              newObjections[i].response = e.target.value
                              setEditablePlaybook({
                                ...editablePlaybook,
                                callScript: { ...editablePlaybook.callScript, objectionHandling: newObjections },
                              })
                            }}
                            rows={3}
                            placeholder="Response"
                          />
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-gray-900">"{obj.objection}"</p>
                          <p className="text-gray-700 pl-4 border-l-2 border-orange-300">{obj.response}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Closing Statement
                </h4>
                {isEditing ? (
                  <Textarea
                    value={editablePlaybook.callScript.closingStatement}
                    onChange={(e) =>
                      setEditablePlaybook({
                        ...editablePlaybook,
                        callScript: { ...editablePlaybook.callScript, closingStatement: e.target.value },
                      })
                    }
                    rows={3}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-700 bg-green-50 p-4 rounded-lg">
                    {editablePlaybook.callScript.closingStatement}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Email Templates Section */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Email Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Cold Outreach Email</h4>
                {isEditing ? (
                  <Textarea
                    value={editablePlaybook.emailTemplates.coldOutreach}
                    onChange={(e) =>
                      setEditablePlaybook({
                        ...editablePlaybook,
                        emailTemplates: { ...editablePlaybook.emailTemplates, coldOutreach: e.target.value },
                      })
                    }
                    rows={10}
                    className="w-full font-mono text-sm"
                  />
                ) : (
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {editablePlaybook.emailTemplates.coldOutreach}
                  </pre>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Follow-up Email</h4>
                {isEditing ? (
                  <Textarea
                    value={editablePlaybook.emailTemplates.followUp}
                    onChange={(e) =>
                      setEditablePlaybook({
                        ...editablePlaybook,
                        emailTemplates: { ...editablePlaybook.emailTemplates, followUp: e.target.value },
                      })
                    }
                    rows={10}
                    className="w-full font-mono text-sm"
                  />
                ) : (
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {editablePlaybook.emailTemplates.followUp}
                  </pre>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Voicemail Script Section */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Voicemail className="w-5 h-5 text-primary" />
                Voicemail Script
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editablePlaybook.voicemailScript}
                  onChange={(e) =>
                    setEditablePlaybook({
                      ...editablePlaybook,
                      voicemailScript: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full"
                />
              ) : (
                <p className="text-gray-700 bg-purple-50 p-4 rounded-lg">{editablePlaybook.voicemailScript}</p>
              )}
            </CardContent>
          </Card>

          {/* Discovery Framework Section */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Discovery Framework
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Open-ended Questions</h4>
                <ul className="space-y-3">
                  {editablePlaybook.discoveryFramework.openEndedQuestions.map((q: string, i: number) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-primary font-semibold">•</span>
                      {isEditing ? (
                        <Textarea
                          value={q}
                          onChange={(e) => {
                            const newQuestions = [...editablePlaybook.discoveryFramework.openEndedQuestions]
                            newQuestions[i] = e.target.value
                            setEditablePlaybook({
                              ...editablePlaybook,
                              discoveryFramework: {
                                ...editablePlaybook.discoveryFramework,
                                openEndedQuestions: newQuestions,
                              },
                            })
                          }}
                          rows={2}
                          className="flex-1"
                        />
                      ) : (
                        <span className="text-gray-700 flex-1">{q}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Key Value Points</h4>
                <ul className="space-y-3">
                  {editablePlaybook.discoveryFramework.keyValuePoints.map((point: string, i: number) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      {isEditing ? (
                        <Textarea
                          value={point}
                          onChange={(e) => {
                            const newPoints = [...editablePlaybook.discoveryFramework.keyValuePoints]
                            newPoints[i] = e.target.value
                            setEditablePlaybook({
                              ...editablePlaybook,
                              discoveryFramework: {
                                ...editablePlaybook.discoveryFramework,
                                keyValuePoints: newPoints,
                              },
                            })
                          }}
                          rows={2}
                          className="flex-1"
                        />
                      ) : (
                        <span className="text-gray-700 flex-1">{point}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Value in Story Form Section */}
          {editablePlaybook.valueInStoryForm && (
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Value in Story Form™
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Customer Outcomes</h4>
                  {isEditing ? (
                    <Textarea
                      value={editablePlaybook.valueInStoryForm.customerOutcomes}
                      onChange={(e) =>
                        setEditablePlaybook({
                          ...editablePlaybook,
                          valueInStoryForm: { ...editablePlaybook.valueInStoryForm, customerOutcomes: e.target.value },
                        })
                      }
                      rows={8}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-gray-700 bg-blue-50 p-4 rounded-lg whitespace-pre-wrap">
                      {editablePlaybook.valueInStoryForm.customerOutcomes}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Outcome Examples</h4>
                  {isEditing ? (
                    <Textarea
                      value={editablePlaybook.valueInStoryForm.outcomeExamples}
                      onChange={(e) =>
                        setEditablePlaybook({
                          ...editablePlaybook,
                          valueInStoryForm: { ...editablePlaybook.valueInStoryForm, outcomeExamples: e.target.value },
                        })
                      }
                      rows={12}
                      className="w-full font-mono text-sm"
                    />
                  ) : (
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap font-sans">
                      {editablePlaybook.valueInStoryForm.outcomeExamples}
                    </pre>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start Simulation Button */}
          <div className="flex justify-center pt-4 pb-8">
            <Button size="lg" onClick={() => onNavigate?.("call-simulation")} className="gap-2 px-8">
              <Play className="w-5 h-5" />
              Start Simulation
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (view === "create") {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/sales/playbooks")} className="mb-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Playbooks
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Playbook</h1>
          <p className="text-gray-600">
            Follow the steps below to create a personalized sales playbook with AI assistance.
          </p>
        </div>

        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={(stepId) => setCurrentStep(stepId)}
        />



        {/* Form Content */}
        <Card className="mb-8 bg-white border-gray-200">
          <CardContent className="p-6">{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          {currentStep < 7 ? (
            <Button onClick={handleNext} disabled={currentStep === 7} className="flex items-center">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => router.push("/sales/playbooks")}
              className="flex items-center"
            >
              Done
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Render the list view with card grid layout
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8" style={{ backgroundColor: "#F9FAFB" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Playbooks</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your sales playbooks and create new ones with AI assistance</p>
        </div>
        <Button onClick={() => router.push("/sales/playbooks/new")} size="lg" className="gap-2 w-full sm:w-auto">
          <Plus className="w-5 h-5" />
          New Playbook
        </Button>
      </div>

      {isLoadingPlaybooks ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="bg-white">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 rounded" />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-10" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : playbooks.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No playbooks yet</h3>
          <p className="text-muted-foreground mb-4">Create your first sales playbook to get started</p>
          <Button onClick={() => router.push("/sales/playbooks/new")} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Create Your First Playbook
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {playbooks.map((playbook: Recording, index: number) => (
            <Card
              key={playbook.id || `playbook-${index}`}
              className="hover:shadow-lg transition-shadow duration-200 animate-slide-in bg-white"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{playbook.title}</CardTitle>
                      {/* Delete button for mobile - hidden on md and above */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlaybook(playbook.id)}
                        className="md:hidden gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created {formatDate(playbook.date)}
                      </div>
                      <span>•</span>
                      <div>Edited {formatDate(playbook.lastEdited)}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Playbook Components Preview */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Phone className="h-3 w-3 text-blue-700" />
                    <span>Call Script</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Mail className="h-3 w-3 text-accent" />
                    <span>Email Templates</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Voicemail className="h-3 w-3 text-chart-1" />
                    <span>Voicemail Script</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <BookOpen className="h-3 w-3 text-chart-2" />
                    <span>Discovery Framework</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPlaybook(playbook.id)}
                    className="flex-1 gap-2 bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartSimulation(playbook.id)}
                    className="flex-1 gap-2 bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Play className="h-3 w-3" />
                    Start Simulation
                  </Button>
                  {/* Delete button for medium and larger screens - hidden on mobile */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePlaybook(playbook.id)}
                    className="hidden md:flex gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
