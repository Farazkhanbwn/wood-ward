"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload, FileText } from "lucide-react"

interface ScriptData {
  title: string
  type: string
  content: string
  assignTo: string
  tags: string
}

interface UploadScriptModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (scriptData: ScriptData) => void
}

export default function UploadScriptModal({ isOpen, onClose, onSave }: UploadScriptModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    content: "",
    assignTo: "",
    tags: "",
  })

  if (!isOpen) return null

  const handleSave = () => {
    onSave(formData)
    setFormData({ title: "", type: "", content: "", assignTo: "", tags: "" })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in-50 duration-300">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-gray-900">
            <FileText className="h-5 w-5" />
            <span>Upload New Playbook</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Playbook Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter playbook title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Playbook Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select playbook type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cold Call">Cold Call Playbook</SelectItem>
                <SelectItem value="Email Template">Email Template</SelectItem>
                <SelectItem value="Follow-up">Follow-up Playbook</SelectItem>
                <SelectItem value="Objection Handling">Objection Handling</SelectItem>
                <SelectItem value="Closing">Closing Playbook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Playbook Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter the playbook content here..."
              rows={8}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignTo">Assign To</Label>
            <Select value={formData.assignTo} onValueChange={(value) => setFormData({ ...formData, assignTo: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Team">All Team Members</SelectItem>
                <SelectItem value="New Reps">New Reps Only</SelectItem>
                <SelectItem value="Senior Reps">Senior Reps Only</SelectItem>
                <SelectItem value="Specific">Specific Members</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., cold-call, objection, closing"
            />
          </div>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Drag and drop a file here, or <button className="text-blue-600 hover:underline">browse</button>
            </p>
            <p className="text-xs text-gray-500 mt-1">Supports .txt, .doc, .docx files</p>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              style={{ borderColor: "#6b7280", color: "#6b7280" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              style={{ backgroundColor: "#284EA7", color: "white" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1e3a8a"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#284EA7"
              }}
            >
              Upload Playbook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
