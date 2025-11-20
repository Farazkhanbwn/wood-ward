"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Filter } from "lucide-react"

interface FilterHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilter: (filters: { dateFrom: string; dateTo: string; member: string; scenario: string; minScore: string; maxScore: string; includeInactive: boolean }) => void
  teamMembers?: any[]
}

export default function FilterHistoryModal({ isOpen, onClose, onApplyFilter, teamMembers = [] }: FilterHistoryModalProps) {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    member: "",
    scenario: "",
    minScore: "",
    maxScore: "",
    includeInactive: false,
  })
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

  const handleApplyFilter = () => {
    onApplyFilter(filters)
    onClose()
  }

  const handleReset = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      member: "",
      scenario: "",
      minScore: "",
      maxScore: "",
      includeInactive: false,
    })
  }

  return (
    <div 
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <Card className={`w-full max-w-md max-h-[90vh] flex flex-col bg-white shadow-xl transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
          <CardTitle className="flex items-center space-x-2 text-gray-900">
            <Filter className="h-5 w-5" />
            <span>Filter Practice History</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto flex-1 ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="member">Team Member</Label>
            <Select value={filters.member} onValueChange={(value) => setFilters({ ...filters, member: value === "all" ? "" : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {teamMembers.map((member: any) => (
                  <SelectItem key={member._id} value={member._id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scenario">Practice Scenario</Label>
            <Select value={filters.scenario} onValueChange={(value) => setFilters({ ...filters, scenario: value === "all" ? "" : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select scenario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scenarios</SelectItem>
                <SelectItem value="cold-call">Cold Call</SelectItem>
                <SelectItem value="discovery-call">Discovery Call</SelectItem>
                <SelectItem value="demo-call">Demo Call</SelectItem>
                <SelectItem value="follow-up-call">Follow-up Call</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minScore">Min Score</Label>
              <Input
                id="minScore"
                type="number"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxScore">Max Score</Label>
              <Input
                id="maxScore"
                type="number"
                min="0"
                max="100"
                value={filters.maxScore}
                onChange={(e) => setFilters({ ...filters, maxScore: e.target.value })}
                placeholder="100"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeInactive"
              checked={filters.includeInactive}
              onCheckedChange={(checked) => setFilters({ ...filters, includeInactive: checked as boolean })}
            />
            <Label htmlFor="includeInactive" className="text-sm">
              Include inactive members
            </Label>
          </div>

          <div className="flex space-x-2 pt-4 flex-shrink-0 border-t bg-white">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 bg-transparent"
              style={{ borderColor: "#6b7280", color: "#6b7280" }}
            >
              Reset
            </Button>
            <Button
              onClick={handleApplyFilter}
              className="flex-1"
              style={{ backgroundColor: "#284EA7", color: "white" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1e3a8a"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#284EA7"
              }}
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
