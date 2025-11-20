"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Play, Clock, Search, BookOpen, Users, Target, MessageSquare, TrendingUp, Star } from "lucide-react"

interface TrainingVideo {
  id: string
  title: string
  description: string
  duration: string
  category: "framework" | "persona" | "messaging" | "techniques"
  difficulty: "beginner" | "intermediate" | "advanced"
  thumbnail: string
  completed: boolean
  rating: number
}

export function TrainingVideosTab() {
  const [videos, setVideos] = useState<TrainingVideo[]>([
    {
      id: "1",
      title: "How to use the Woodward Framework",
      description: "Master the proven Woodward sales methodology for consistent results",
      duration: "12:34",
      category: "framework",
      difficulty: "beginner",
      thumbnail: "/sales-training-thumbnail.png",
      completed: true,
      rating: 4.8,
    },
    {
      id: "2",
      title: "How to input persona/product data",
      description: "Learn to effectively gather and organize customer persona information",
      duration: "8:45",
      category: "persona",
      difficulty: "beginner",
      thumbnail: "/customer-persona-data-training.jpg",
      completed: true,
      rating: 4.6,
    },
    {
      id: "3",
      title: "How to craft a core email message",
      description: "Create compelling email messages that get responses",
      duration: "15:22",
      category: "messaging",
      difficulty: "intermediate",
      thumbnail: "/email-writing-training-video.jpg",
      completed: false,
      rating: 4.9,
    },
    {
      id: "4",
      title: "How to upload messaging",
      description: "Best practices for organizing and uploading your sales messaging",
      duration: "6:18",
      category: "messaging",
      difficulty: "beginner",
      thumbnail: "/messaging-upload-tutorial.jpg",
      completed: false,
      rating: 4.5,
    },
    {
      id: "5",
      title: "Advanced Objection Handling",
      description: "Turn objections into opportunities with proven techniques",
      duration: "18:45",
      category: "techniques",
      difficulty: "advanced",
      thumbnail: "/objection-handling-training.jpg",
      completed: false,
      rating: 4.7,
    },
    {
      id: "6",
      title: "Building Buyer Personas",
      description: "Create detailed buyer personas that drive sales success",
      duration: "14:12",
      category: "persona",
      difficulty: "intermediate",
      thumbnail: "/buyer-persona-creation.jpg",
      completed: false,
      rating: 4.4,
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedVideo, setSelectedVideo] = useState<TrainingVideo | null>(null)

  const categories = [
    { id: "all", label: "All Videos", icon: BookOpen },
    { id: "framework", label: "Framework", icon: Target },
    { id: "persona", label: "Persona", icon: Users },
    { id: "messaging", label: "Messaging", icon: MessageSquare },
    { id: "techniques", label: "Techniques", icon: TrendingUp },
  ]

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "framework":
        return "bg-blue-50 text-blue-700"
      case "persona":
        return "bg-accent/10 text-accent"
      case "messaging":
        return "bg-chart-1/10 text-chart-1"
      case "techniques":
        return "bg-chart-2/10 text-chart-2"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-blue-50 text-blue-700"
      case "intermediate":
        return "bg-chart-2/10 text-chart-2"
      case "advanced":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleVideoComplete = (videoId: string) => {
    setVideos(videos.map((v) => (v.id === videoId ? { ...v, completed: true } : v)))
  }

  return (
    <div className="p-8 space-y-8" style={{ backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">Training Videos</h1>
        <p className="text-muted-foreground">Learn sales techniques and best practices</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`gap-2 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? ""
                    : "bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="animate-fade-in bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{videos.filter((v) => v.completed).length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {videos.length - videos.filter((v) => v.completed).length}
              </div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-1">
                {Math.round((videos.filter((v) => v.completed).length / videos.length) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
          </div>
          <div className="mt-4 bg-muted rounded-full h-2">
            <div
              className="bg-blue-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(videos.filter((v) => v.completed).length / videos.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video, index) => (
          <Card
            key={video.id}
            className="hover:shadow-lg transition-shadow duration-200 animate-slide-in cursor-pointer bg-white"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => setSelectedVideo(video)}
          >
            <div className="relative">
              <img
                src={video.thumbnail || "/placeholder.svg"}
                alt={video.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-black/20 rounded-t-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white/90 rounded-full p-3">
                  <Play className="h-6 w-6 text-primary" />
                </div>
              </div>
              {video.completed && (
                <div className="absolute top-2 right-2 bg-blue-50 text-blue-700 rounded-full p-1">
                  <Star className="h-4 w-4 fill-current" />
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {video.duration}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground line-clamp-2">{video.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge className={getCategoryColor(video.category)}>{video.category}</Badge>
                    <Badge className={getDifficultyColor(video.difficulty)}>{video.difficulty}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    {video.rating}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No videos found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Video Player Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
            <DialogDescription>{selectedVideo?.description}</DialogDescription>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="bg-blue-50 rounded-full p-6 mx-auto w-fit">
                    <Play className="h-12 w-12 text-blue-700" />
                  </div>
                  <p className="text-muted-foreground">Video player would be embedded here</p>
                  <Button onClick={() => handleVideoComplete(selectedVideo.id)} className="gap-2">
                    <Play className="h-4 w-4" />
                    Play Video ({selectedVideo.duration})
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge className={getCategoryColor(selectedVideo.category)}>{selectedVideo.category}</Badge>
                  <Badge className={getDifficultyColor(selectedVideo.difficulty)}>{selectedVideo.difficulty}</Badge>
                  {selectedVideo.completed && <Badge className="bg-blue-50 text-blue-700">Completed</Badge>}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {selectedVideo.duration}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
