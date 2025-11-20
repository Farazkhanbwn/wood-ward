"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Calendar, User } from "lucide-react"

interface ScheduleSessionModalProps {
  isOpen: boolean
  onClose: () => void
  memberName: string
}

export default function ScheduleSessionModal({ isOpen, onClose, memberName }: ScheduleSessionModalProps) {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: "",
    scenario: "",
    notes: "",
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Scheduling session:", formData)
    // Handle form submission
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in-50 duration-300">
      <Card className="w-full max-w-md mx-4 animate-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-900 flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Schedule Practice Session</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600 font-medium">{memberName}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scenario">Practice Scenario</Label>
              <Select value={formData.scenario} onValueChange={(value) => setFormData({ ...formData, scenario: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cold-call">Cold Call</SelectItem>
                  <SelectItem value="product-demo">Product Demo</SelectItem>
                  <SelectItem value="objection-handling">Objection Handling</SelectItem>
                  <SelectItem value="closing">Closing Techniques</SelectItem>
                  <SelectItem value="follow-up">Follow-up Call</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Session Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any specific focus areas or notes for this session..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
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
                Schedule Session
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
