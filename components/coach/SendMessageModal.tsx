"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Mail, MessageSquare, User, Clock } from "lucide-react"

interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
  memberName: string
  memberEmail: string
}

export default function SendMessageModal({ isOpen, onClose, memberName, memberEmail }: SendMessageModalProps) {
  const [messageType, setMessageType] = useState("email")
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    priority: "normal",
    template: "",
  })

  if (!isOpen) return null

  const templates = {
    "session-reminder":
      "Hi {name}, this is a friendly reminder about your practice session scheduled for tomorrow. Please be prepared with your materials. Looking forward to working with you!",
    "performance-feedback":
      "Hi {name}, great job on your recent practice session! I wanted to share some feedback and areas for improvement. Let's schedule a follow-up to discuss your progress.",
    motivation:
      "Hi {name}, I wanted to reach out and acknowledge your hard work and dedication. Your improvement in recent sessions has been impressive. Keep up the excellent work!",
    "goal-setting":
      "Hi {name}, let's schedule some time to review your current goals and set new targets for the upcoming period. Your progress has been solid and I'd like to help you reach the next level.",
  }

  const handleTemplateSelect = (template: string) => {
    if (templates[template as keyof typeof templates]) {
      setFormData({
        ...formData,
        template,
        message: templates[template as keyof typeof templates].replace("{name}", memberName),
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Sending message:", formData)
    // Handle form submission
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in-50 duration-300">
      <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-900 flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Send Message</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <span className="text-blue-600 font-medium">{memberName}</span>
                <div className="text-sm text-blue-500">{memberEmail}</div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                type="button"
                variant={messageType === "email" ? "default" : "outline"}
                size="sm"
                onClick={() => setMessageType("email")}
                className={messageType === "email" ? "bg-[#284EA7] text-white" : ""}
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
              <Button
                type="button"
                variant={messageType === "sms" ? "default" : "outline"}
                size="sm"
                onClick={() => setMessageType("sms")}
                className={messageType === "sms" ? "bg-[#284EA7] text-white" : ""}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                SMS
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Quick Templates</Label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="session-reminder">Session Reminder</SelectItem>
                  <SelectItem value="performance-feedback">Performance Feedback</SelectItem>
                  <SelectItem value="motivation">Motivational Message</SelectItem>
                  <SelectItem value="goal-setting">Goal Setting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {messageType === "email" && (
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder={messageType === "email" ? "Type your email message..." : "Type your SMS message..."}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                required
              />
              <div className="text-sm text-gray-500 text-right">
                {formData.message.length} characters
                {messageType === "sms" && formData.message.length > 160 && (
                  <span className="text-orange-500 ml-1">(Multiple SMS)</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Message will be sent immediately</span>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="submit"
                className="flex-1"
                style={{ backgroundColor: "#284EA7", color: "white" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#1e3a8a"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#284EA7"
                }}
              >
                Send {messageType === "email" ? "Email" : "SMS"}
              </Button>
              <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
