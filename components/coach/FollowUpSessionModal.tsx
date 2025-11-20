"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Calendar, Clock, User } from "lucide-react"

interface PreviousSession {
  member: string
  date: string
  score: number
  scenario: string
  feedback: string
}

interface FollowUpSessionModalProps {
  isOpen: boolean
  onClose: () => void
  memberName: string
  previousSession: PreviousSession | null
}

export default function FollowUpSessionModal({
  isOpen,
  onClose,
  memberName,
  previousSession,
}: FollowUpSessionModalProps) {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: "30",
    scenario: "",
    focusAreas: "",
    notes: "",
  })

  if (!isOpen) return null

  const handleButtonClick = (): void => {
    console.log("Follow-up session scheduled:", formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in-50 duration-300">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto  animate-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-900">Schedule Follow-up Session</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {/* Member Info */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Follow-up for: {memberName}</span>
              </div>
              <div className="text-sm text-blue-700">
                Previous session: {previousSession?.scenario} - Score: {previousSession?.score}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-gray-700">
                  Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-gray-700">
                  Time
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Duration and Scenario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-gray-700">
                  Duration (minutes)
                </Label>
                <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scenario" className="text-gray-700">
                  Practice Scenario
                </Label>
                <Select value={formData.scenario} onValueChange={(value) => setFormData({ ...formData, scenario: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="objection-handling">Objection Handling</SelectItem>
                    <SelectItem value="closing-techniques">Closing Techniques</SelectItem>
                    <SelectItem value="cold-calling">Cold Calling</SelectItem>
                    <SelectItem value="product-demo">Product Demo</SelectItem>
                    <SelectItem value="price-negotiation">Price Negotiation</SelectItem>
                    <SelectItem value="follow-up-calls">Follow-up Calls</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Focus Areas */}
            <div className="space-y-2">
              <Label htmlFor="focusAreas" className="text-gray-700">
                Focus Areas (based on previous feedback)
              </Label>
              <Textarea
                id="focusAreas"
                placeholder="e.g., Work on handling price objections, improve closing confidence..."
                value={formData.focusAreas}
                onChange={(e) => setFormData({ ...formData, focusAreas: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            {/* Session Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700">
                Session Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or specific goals for this session..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                className="flex-1"
                style={{ backgroundColor: "#284EA7", color: "white" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#1e3a8a"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#284EA7"
                }}
                onClick={handleButtonClick}
              >
                Schedule Session
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
                style={{ borderColor: "#6b7280", color: "#6b7280" }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
