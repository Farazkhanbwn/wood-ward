"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface AddNewRepModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (repData: { name: string; email: string; phone: string }) => void
}

export default function AddNewRepModal({ isOpen, onClose, onSave }: AddNewRepModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible) return null

  const handleClose = () => {
    setFormData({ name: "", email: "", phone: "" })
    onClose()
  }

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      return
    }
    setIsLoading(true)
    try {
      await onSave(formData)
      setFormData({ name: "", email: "", phone: "" })
    } catch (error) {
      console.error('Error adding rep:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <Card className={`w-full max-w-md max-h-[90vh] flex flex-col bg-white shadow-xl transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-900">Add New Sales Rep</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>



          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-transparent"
              style={{ borderColor: "#6b7280", color: "#6b7280" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={!formData.name || !formData.email || isLoading}
              style={{ backgroundColor: "#284EA7", color: "white" }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = "#1e3a8a"
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = "#284EA7"
              }}
            >
              {isLoading ? "Adding..." : "Add Rep"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
