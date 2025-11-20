"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Save, FileText, Mail } from "lucide-react"

interface ScriptData {
  id?: number
  title: string
  type: string
  content: string
  assignedTo: string
  tags: string[]
  notes: string
}

interface EditScriptModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (scriptData: ScriptData) => void
  script: ScriptData | null
}

export default function EditScriptModal({ isOpen, onClose, onSave, script }: EditScriptModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    type: "Script",
    content: "",
    assignedTo: "All Team",
    tags: [] as string[],
    notes: "",
  })

  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    if (script) {
      setFormData({
        title: script.title || "",
        type: script.type || "Script",
        content: script.content || "",
        assignedTo: script.assignedTo || "All Team",
        tags: script.tags || [],
        notes: script.notes || "",
      })
    }
  }, [script])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, id: script?.id })
    onClose()
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {formData.type === "Script" ? (
              <FileText className="h-6 w-6" style={{ color: "#284EA7" }} />
            ) : (
              <Mail className="h-6 w-6" style={{ color: "#284EA7" }} />
            )}
            <h2 className="text-xl font-semibold text-gray-900">Edit {formData.type}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-100">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter script title"
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                Type *
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Script">Script</SelectItem>
                  <SelectItem value="Email">Email Template</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo" className="text-sm font-medium text-gray-700">
              Assigned To
            </Label>
            <Select value={formData.assignedTo} onValueChange={(value) => setFormData((prev) => ({ ...prev, assignedTo: value }))}>
              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Team">All Team</SelectItem>
                <SelectItem value="John Smith">John Smith</SelectItem>
                <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                <SelectItem value="Mike Davis">Mike Davis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-gray-700">
              Content *
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder={
                formData.type === "Script" ? "Enter your script content here..." : "Enter your email template here..."
              }
              rows={8}
              required
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Tags</Label>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                style={{ borderColor: "#284EA7", color: "#284EA7" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#284EA7"
                  e.currentTarget.style.color = "white"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.color = "#284EA7"
                }}
              >
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes or instructions..."
              rows={3}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} className="hover:bg-gray-50 bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              className="transition-colors"
              style={{ backgroundColor: "#284EA7", color: "white" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1e3a8a"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#284EA7"
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
