"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { getMicrophoneStream, floatTo16BitPCM, pcmToBase64, base64ToPCM, playPCMAudio } from "@/lib/audio-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useDialog } from "@/hooks"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import {
  Play,
  Settings,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Save,
  Eye,
  Trash2,
  Radio,
  Lightbulb,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface CallFeedback {
  strengths: string[]
  weaknesses: string[]
  improvementPoints: string[]
  overallScore: number
  callId: string
  date: string
  duration: string
  title: string
  callType: string
}

export function CallSimulationTab() {
  const { showAlert, showConfirm } = useDialog()
  const queryClient = useQueryClient()
  const [selectedCallType, setSelectedCallType] = useState<string | null>(null)
  const [callGoal, setCallGoal] = useState("")
  const [selectedVoice, setSelectedVoice] = useState<string>("alloy")
  const [isCallActive, setIsCallActive] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [currentFeedback, setCurrentFeedback] = useState<CallFeedback | null>(null)
  const [savedSessions, setSavedSessions] = useState<CallFeedback[]>([])
  const [viewingSession, setViewingSession] = useState<CallFeedback | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isListening, setIsListening] = useState(true)
  const [conversation, setConversation] = useState<Array<{ speaker: string; message: string; timestamp: number }>>([])
  const [coachingNudges, setCoachingNudges] = useState<Array<{ message: string; timestamp: number }>>([])
  const [voiceSessionId, setVoiceSessionId] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)

  const wsRef = useRef<WebSocket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const audioQueueRef = useRef<Int16Array[]>([])
  const isPlayingAudioRef = useRef(false)
  const playbackAudioContextRef = useRef<AudioContext | null>(null)
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const isMutedRef = useRef(false)

  // Cleanup function to properly close audio contexts
  const cleanupAudioContexts = useCallback(async (includePlayback = true) => {
    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop()
      } catch (e) {}
      currentAudioSourceRef.current = null
    }
    
    if (processorRef.current) {
      try {
        processorRef.current.disconnect()
      } catch (e) {}
      processorRef.current = null
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        await audioContextRef.current.close()
      } catch (e) {}
      audioContextRef.current = null
    }
    
    // Only cleanup playback context when explicitly requested (call end)
    if (includePlayback && playbackAudioContextRef.current && playbackAudioContextRef.current.state !== 'closed') {
      try {
        await playbackAudioContextRef.current.close()
      } catch (e) {}
      playbackAudioContextRef.current = null
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop()
        track.enabled = false
      })
      mediaStreamRef.current = null
    }
  }, [])

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setIsLoadingSessions(true)
      const response = await api.getCallSessions(5, 0)
      if (response.success && response.sessions) {
        const formattedSessions = response.sessions.map((session: any) => ({
          strengths: session.feedback.strengths,
          weaknesses: session.feedback.weaknesses,
          improvementPoints: session.feedback.improvementPoints,
          overallScore: session.feedback.overallScore,
          callId: session._id,
          date: new Date(session.createdAt).toISOString().split('T')[0],
          duration: `${Math.floor(session.duration / 60)}:${(session.duration % 60).toString().padStart(2, '0')}`,
          title: `${session.callType} Simulation`,
          callType: session.callType,
        }))
        setSavedSessions(formattedSessions)
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
      setSavedSessions([])
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const callTypes = [
    {
      id: "cold-call",
      title: "Cold Call",
      description: "Initial outreach to new prospects",
    },
    {
      id: "discovery-call",
      title: "Discovery Call",
      description: "Uncover needs and pain points",
    },
    {
      id: "demo-call",
      title: "Demo Call",
      description: "Product demonstration and Q&A",
    },
    {
      id: "follow-up-call",
      title: "Follow-up Call",
      description: "Continue previous conversation",
    },
  ]

  const voiceOptions = [
    { id: "alloy", name: "Alloy", description: "Neutral and balanced" },
    { id: "echo", name: "Echo", description: "Warm and engaging" },
    { id: "fable", name: "Fable", description: "Expressive and dynamic" },
    { id: "onyx", name: "Onyx", description: "Deep and authoritative" },
    { id: "nova", name: "Nova", description: "Energetic and friendly" },
    { id: "shimmer", name: "Shimmer", description: "Soft and gentle" },
  ]

  const coachingFeatures = [
    { name: "Real-time transcription", available: true },
    { name: "Post-call feedback", available: true },
    { name: "Performance scoring", available: true },
    { name: "Mid-call coaching (v2)", available: false },
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isCallActive])

  useEffect(() => {
    return () => {
      cleanupAudioContexts()
      if (wsRef.current) {
        try {
          wsRef.current.close()
        } catch (e) {}
        wsRef.current = null
      }
    }
  }, [cleanupAudioContexts])

  const startCall = async () => {
    if (!selectedCallType || isConnecting) return
    
    setIsConnecting(true)
    
    try {
      const selectedType = callTypes.find(type => type.id === selectedCallType)
      const topic = `${selectedType?.title}: ${callGoal || 'Sales call simulation'}`
      
      console.log('🎤 Starting call with voice:', selectedVoice)
      console.log('📞 API Request:', { topic, voice: selectedVoice, top_k: 5 })
      
      const session = await api.createVoiceSession({ topic, voice: selectedVoice, top_k: 5 })
      console.log('✅ Session created:', session)
      setVoiceSessionId(session.session_id)
      
      const wsUrl = api.getVoiceWebSocketUrl(session.session_id)
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        callActiveRef.current = true
        setIsCallActive(true)
        setIsConnecting(false)
        setShowFeedback(false)
        setCurrentFeedback(null)
        setViewingSession(null)
        setCallDuration(0)
        setConversation([])
        setCoachingNudges([])
        setIsMuted(false)
        isMutedRef.current = false
        setIsListening(true)
      }
      
      let audioChunks: Int16Array[] = []
      let isProcessing = false
      let callActiveRef = { current: true }
      
      const playbackContext = new AudioContext({ sampleRate: 24000 })
      playbackAudioContextRef.current = playbackContext
      
      const playAudioQueue = async () => {
        if (isProcessing || audioChunks.length === 0 || !callActiveRef.current) return
        
        isProcessing = true
        isPlayingAudioRef.current = true
        setIsListening(false)
        
        const chunksToPlay = [...audioChunks]
        audioChunks = []
        
        const combinedLength = chunksToPlay.reduce((sum, chunk) => sum + chunk.length, 0)
        const combined = new Int16Array(combinedLength)
        let offset = 0
        
        for (const chunk of chunksToPlay) {
          combined.set(chunk, offset)
          offset += chunk.length
        }
        
        const audioBuffer = playbackContext.createBuffer(1, combined.length, 24000)
        const channelData = audioBuffer.getChannelData(0)
        
        for (let i = 0; i < combined.length; i++) {
          channelData[i] = combined[i] / 32768.0
        }
        
        const source = playbackContext.createBufferSource()
        source.buffer = audioBuffer
        source.connect(playbackContext.destination)
        currentAudioSourceRef.current = source
        source.start()
        
        await new Promise((resolve) => {
          source.onended = () => {
            currentAudioSourceRef.current = null
            resolve(null)
          }
        })
        
        isProcessing = false
        isPlayingAudioRef.current = false
        if (callActiveRef.current) {
          setIsListening(true)
        }
      }
      
      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data)
        
        if (message.type === 'response.audio.delta' && message.delta) {
          const pcmData = base64ToPCM(message.delta)
          audioChunks.push(pcmData)
        }
        
        if (message.type === 'response.audio.done') {
          await playAudioQueue()
        }
        
        if (message.type === 'conversation.item.input_audio_transcription.completed') {
          setConversation(prev => [...prev, {
            speaker: 'You',
            message: message.transcript || '',
            timestamp: Date.now()
          }])
        }
        
        if (message.type === 'response.audio_transcript.done') {
          setConversation(prev => [...prev, {
            speaker: 'AI Prospect',
            message: message.transcript || '',
            timestamp: Date.now()
          }])
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      
      ws.onclose = () => {
        console.log('WebSocket closed')
        callActiveRef.current = false
        audioChunks = []
        setIsConnecting(false)
      }
      
      wsRef.current = ws
      
      // Clean up only input audio contexts, keep playback separate
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          track.stop()
          track.enabled = false
        })
        mediaStreamRef.current = null
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          await audioContextRef.current.close()
        } catch (e) {}
        audioContextRef.current = null
      }
      
      const stream = await getMicrophoneStream()
      mediaStreamRef.current = stream
      
      const audioContext = new AudioContext({ sampleRate: 24000 })
      audioContextRef.current = audioContext
      
      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor
      
      processor.onaudioprocess = (e) => {
        try {
          if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
          
          const inputData = e.inputBuffer.getChannelData(0)
          
          // Validate buffer data
          if (!inputData || inputData.length === 0) return
          
          // Detect if user is speaking (voice activity detection with safer threshold)
          let sum = 0
          for (let i = 0; i < inputData.length; i++) {
            const sample = inputData[i]
            if (isNaN(sample) || !isFinite(sample)) continue
            sum += sample * sample
          }
          const rms = Math.sqrt(sum / inputData.length)
          const voiceThreshold = 0.005 // More sensitive threshold
          setIsSpeaking(!isMutedRef.current && rms > voiceThreshold)
          
          // Don't send audio when muted
          if (isMutedRef.current) return
          
          try {
            const pcm16 = floatTo16BitPCM(inputData)
            const base64Audio = pcmToBase64(pcm16)
            
            if (isPlayingAudioRef.current) {
              wsRef.current.send(JSON.stringify({
                type: 'response.cancel'
              }))
              audioChunks = []
              isPlayingAudioRef.current = false
              setIsListening(true)
            }
            
            wsRef.current.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: base64Audio
            }))
          } catch (audioError) {
            console.warn('Audio processing error:', audioError)
          }
        } catch (error) {
          console.error('Audio processor error:', error)
        }
      }
      
      source.connect(processor)
      processor.connect(audioContext.destination)
      
    } catch (error) {
      console.error('Failed to start call:', error)
      setIsConnecting(false)
      alert('Failed to start voice call. Please try again.')
    }
  }

  const endCall = async () => {
    setIsCallActive(false)
    audioQueueRef.current = []
    isPlayingAudioRef.current = false
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    await cleanupAudioContexts(true) // Include playback cleanup on call end
    
    setIsListening(true)
    const selectedType = callTypes.find((type) => type.id === selectedCallType)
    const feedback: CallFeedback = {
      strengths: [
        "Excellent rapport building at the beginning",
        "Asked relevant discovery questions",
        "Handled objections professionally",
      ],
      weaknesses: [
        "Spoke too quickly during value proposition",
        "Missed opportunity to address budget concerns",
        "Could have been more confident in closing",
      ],
      improvementPoints: [
        "Practice slowing down speech during key moments",
        "Develop stronger budget qualification questions",
        "Work on assumptive closing techniques",
      ],
      overallScore: 78,
      callId: `call-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      duration: `${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, "0")}`,
      title: `${selectedType?.title || "Call"} Simulation - ${new Date().toLocaleDateString()}`,
      callType: selectedType?.title || "Unknown",
    }
    
    // Auto-save to database
    if (voiceSessionId) {
      try {
        const sessionData = {
          callType: selectedCallType,
          callGoal,
          voiceUsed: selectedVoice,
          duration: callDuration,
          transcript: conversation,
          feedback: {
            strengths: feedback.strengths,
            weaknesses: feedback.weaknesses,
            improvementPoints: feedback.improvementPoints,
            overallScore: feedback.overallScore,
          },
          sessionId: voiceSessionId,
        }

        await api.saveCallSession(sessionData)
        await loadSessions() // Reload sessions from database
      } catch (error) {
        console.error('Failed to auto-save session:', error)
      }
    }
    
    setCurrentFeedback(feedback)
    setShowFeedback(true)
  }

  const saveFeedback = async () => {
    if (currentFeedback && voiceSessionId) {
      try {
        const sessionData = {
          callType: selectedCallType,
          callGoal,
          voiceUsed: selectedVoice,
          duration: callDuration,
          transcript: conversation,
          feedback: {
            strengths: currentFeedback.strengths,
            weaknesses: currentFeedback.weaknesses,
            improvementPoints: currentFeedback.improvementPoints,
            overallScore: currentFeedback.overallScore,
          },
          sessionId: voiceSessionId,
        }

        const response = await api.saveCallSession(sessionData)
        
        if (response.success) {
          await loadSessions() // Reload from database
          setShowFeedback(false)
          setCurrentFeedback(null)
          setCallGoal("")
          setSelectedCallType(null)
          setVoiceSessionId(null)
          
          showAlert({
            title: "Success",
            message: "Call session saved successfully!",
            confirmText: "OK"
          })
        }
      } catch (error) {
        console.error('Failed to save session:', error)
        showAlert({
          title: "Error",
          message: "Failed to save session. Please try again.",
          confirmText: "OK"
        })
      }
    }
  }

  const viewSessionFeedback = (session: CallFeedback) => {
    setViewingSession(session)
    setShowFeedback(true)
  }

  const deleteSession = async (callId: string) => {
    showConfirm({
      title: "Delete Session",
      message: "Are you sure you want to delete this call session? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          const response = await api.deleteCallSession(callId)
          if (response.success) {
            await loadSessions()
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
            toast.success("Call session deleted successfully")
          }
        } catch (error) {
          console.error('Failed to delete session:', error)
          toast.error("Failed to delete session. Please try again.")
        }
      }
    })
  }

  const playSession = (session: CallFeedback) => {
    showAlert({
      title: "Session Details",
      message: `${session.title}\n\nDuration: ${session.duration}\nScore: ${session.overallScore}/100\nDate: ${new Date(session.date).toLocaleDateString()}\n\nNote: Audio playback feature coming in next update!`,
      confirmText: "OK"
    })
  }

  if (showFeedback && (currentFeedback || viewingSession)) {
    const displayFeedback = currentFeedback || viewingSession
    if (!displayFeedback) return null

    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Call Simulation Feedback</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Review your {displayFeedback.callType.toLowerCase()} performance and areas for improvement
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Overall Score */}
            <Card className="text-center animate-fade-in bg-white border-gray-200">
              <CardHeader>
                <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-primary">{displayFeedback.overallScore}</span>
                </div>
                <CardTitle className="text-2xl">Overall Performance Score</CardTitle>
                <CardDescription>
                  {displayFeedback.overallScore >= 90
                    ? "Excellent work!"
                    : displayFeedback.overallScore >= 80
                      ? "Good performance!"
                      : displayFeedback.overallScore >= 70
                        ? "Room for improvement"
                        : "Needs significant work"}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feedback Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Strengths */}
              <Card className="animate-slide-in bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <CheckCircle className="h-5 w-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {displayFeedback.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                      <p className="text-sm">{strength}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Weaknesses */}
              <Card className="animate-slide-in bg-white border-gray-200" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    Weaknesses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {displayFeedback.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0" />
                      <p className="text-sm">{weakness}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Improvement Points */}
              <Card className="animate-slide-in bg-white border-gray-200" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <TrendingUp className="h-5 w-5" />
                    Improvement Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {displayFeedback.improvementPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                      <p className="text-sm">{point}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {currentFeedback && (
                <Button size="lg" onClick={saveFeedback} className="gap-2 bg-primary hover:bg-primary/90">
                  <Save className="h-5 w-5" />
                  Save Feedback
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setShowFeedback(false)
                  setCurrentFeedback(null)
                  setViewingSession(null)
                }}
                className="gap-2 border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Phone className="h-5 w-5" />
                {viewingSession ? "Back to Simulations" : "Start New Simulation"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isCallActive) {
    const selectedType = callTypes.find((type) => type.id === selectedCallType)
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Role Play Simulation</h1>
            <p className="text-sm sm:text-base text-gray-600">Practicing {selectedType?.title.toLowerCase()} with AI prospect</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Call Status Header */}
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive" className="animate-pulse gap-1">
                        <Radio className="h-3 w-3" />
                        LIVE
                      </Badge>
                      <div className="flex items-center gap-2 text-lg font-mono font-semibold">
                        <Clock className="h-4 w-4" />
                        {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, "0")}
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1 bg-red-50 text-red-700 border-red-200">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      Recording
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mt-2">{selectedType?.title} with Sarah Mitchell</CardTitle>
                  <CardDescription>VP of Operations at TechFlow Solutions</CardDescription>
                </CardHeader>
              </Card>

              {/* AI Avatar Component */}
              <Card className="bg-linear-to-br from-primary/5 to-blue-50 border-primary/20">
                <CardContent className="pt-8 pb-8">
                  <div className="flex flex-col items-center justify-center">
                    {/* AI Avatar with animated rings */}
                    <div className="relative">
                      {/* Zoom-like border animation - only when speaking */}
                      {isSpeaking && !isMuted && (
                        <div className="absolute inset-0 -m-2 rounded-full ring-4 ring-green-500 animate-zoom-pulse" />
                      )}
                      
                      {/* Main avatar circle with image */}
                      <div className="relative w-48 h-48 rounded-full shadow-2xl overflow-hidden border-4 border-white">
                        <img
                          src="/images/avatar.jpeg"
                          alt="Your Avatar"
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Sound wave indicator when speaking */}
                        {isSpeaking && !isMuted && (
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            <div className="w-1 bg-green-400 rounded-full animate-sound-wave" style={{ height: "12px", animationDelay: "0s" }} />
                            <div className="w-1 bg-green-400 rounded-full animate-sound-wave" style={{ height: "16px", animationDelay: "0.1s" }} />
                            <div className="w-1 bg-green-400 rounded-full animate-sound-wave" style={{ height: "20px", animationDelay: "0.2s" }} />
                            <div className="w-1 bg-green-400 rounded-full animate-sound-wave" style={{ height: "16px", animationDelay: "0.3s" }} />
                            <div className="w-1 bg-green-400 rounded-full animate-sound-wave" style={{ height: "12px", animationDelay: "0.4s" }} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Avatar label */}
                    <div className="mt-8 text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">You</h3>
                      <p className="text-sm text-gray-600 mb-2">Sales Representative</p>
                      <Badge variant="outline" className={`gap-1 ${
                        isSpeaking && !isMuted
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          isSpeaking && !isMuted
                            ? 'bg-green-500 animate-pulse' 
                            : 'bg-gray-400'
                        }`} />
                        {isSpeaking && !isMuted ? 'Speaking' : isMuted ? 'Muted' : 'Listening'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conversation Transcript */}
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Live Conversation</CardTitle>
                  <CardDescription>AI prospect responses appear in real-time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 min-h-[300px] max-h-[300px] overflow-y-auto">
                    {conversation.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p className="text-sm">Waiting for conversation to begin...</p>
                      </div>
                    ) : (
                      conversation.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.speaker === "AI Prospect" ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-lg ${message.speaker === "AI Prospect" ? "bg-gray-100 text-gray-900" : "bg-primary text-white"
                              }`}
                          >
                            <p className="text-xs font-semibold mb-1 opacity-70">{message.speaker}</p>
                            <p className="text-sm">{message.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* User Input Section */}
              <Card className="bg-white border-gray-200">
                <CardContent className="pt-6">
                  {/* Mobile layout: 3 rows */}
                  <div className="sm:hidden space-y-4">
                    {/* Row 1: Mic icon */}
                    <div className="flex justify-center">
                      <div
                        className={`p-4 rounded-full ${isListening && !isMuted ? "bg-green-100 animate-pulse" : "bg-gray-100"}`}
                      >
                        {isMuted ? (
                          <MicOff className="h-6 w-6 text-gray-400" />
                        ) : (
                          <Mic className={`h-6 w-6 ${isListening ? "text-green-600" : "text-gray-400"}`} />
                        )}
                      </div>
                    </div>

                    {/* Row 2: Text */}
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">
                        {isMuted ? "Microphone Muted" : isListening ? "Listening..." : "Microphone Ready"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {isMuted ? "Click to unmute and speak" : "Your speech is being captured and analyzed by AI"}
                      </p>
                    </div>

                    {/* Row 3: Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          const newMutedState = !isMuted
                          setIsMuted(newMutedState)
                          isMutedRef.current = newMutedState
                        }}
                        className={`w-full sm:flex-1 gap-2 ${isMuted ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" : ""}`}
                      >
                        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        <span className="sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
                      </Button>
                      <Button variant="destructive" size="lg" onClick={endCall} className="w-full sm:flex-1 gap-2">
                        <PhoneOff className="h-5 w-5" />
                        <span className="sm:inline">End Call</span>
                      </Button>
                    </div>
                  </div>

                  {/* Medium and large devices: Original layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-4 rounded-full ${isListening && !isMuted ? "bg-green-100 animate-pulse" : "bg-gray-100"}`}
                      >
                        {isMuted ? (
                          <MicOff className="h-6 w-6 text-gray-400" />
                        ) : (
                          <Mic className={`h-6 w-6 ${isListening ? "text-green-600" : "text-gray-400"}`} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {isMuted ? "Microphone Muted" : isListening ? "Listening..." : "Microphone Ready"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {isMuted ? "Click to unmute and speak" : "Your speech is being captured and analyzed by AI"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          const newMutedState = !isMuted
                          setIsMuted(newMutedState)
                          isMutedRef.current = newMutedState
                        }}
                        className={`gap-2 ${isMuted ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" : ""}`}
                      >
                        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        {isMuted ? "Unmute" : "Mute"}
                      </Button>
                      <Button variant="destructive" size="lg" onClick={endCall} className="gap-2">
                        <PhoneOff className="h-5 w-5" />
                        End Call
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-Time Coaching Nudges */}
            <Card className="bg-white border-gray-200 h-auto self-start">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Real-Time Coaching
                </CardTitle>
                <CardDescription>AI-powered tips during your call</CardDescription>
              </CardHeader>
              <CardContent className="h-auto">
                <div className="space-y-3">
                  {coachingNudges.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        Coaching tips will appear here during your call
                      </p>
                    </div>
                  ) : (
                    coachingNudges.map((nudge, index) => (
                      <div
                        key={index}
                        className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg animate-slide-in"
                      >
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                          <p className="text-sm text-gray-900">{nudge.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Prospect Info Quick Reference */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Prospect Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">Sarah Mitchell</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Title:</span>
                    <span className="ml-2 font-medium">VP of Operations</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Style:</span>
                    <span className="ml-2 font-medium">Direct, data-driven</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-gray-600 mb-1">Key Pain Points:</p>
                    <ul className="space-y-1 ml-2">
                      <li className="text-xs">• Manual processes (30% loss)</li>
                      <li className="text-xs">• Project tracking issues</li>
                      <li className="text-xs">• Remote collaboration</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Call Simulation</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Practice your sales calls with AI prospects and receive real-time coaching feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Select Call Type */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl">Select Call Type</CardTitle>
                <CardDescription>Choose the type of call you want to simulate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {callTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedCallType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                      onClick={() => setSelectedCallType(type.id)}
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">{type.title}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Call Goal */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl">Call Goal</CardTitle>
                <CardDescription>Define what you want to achieve in this call</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="e.g., Schedule a demo meeting, qualify budget and timeline, understand current pain points..."
                  value={callGoal}
                  onChange={(e) => setCallGoal(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </CardContent>
            </Card>

            {/* AI Voice Selection */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl">AI Prospect Voice</CardTitle>
                <CardDescription>Choose the voice for your AI prospect</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {voiceOptions.map((voice) => (
                    <div
                      key={voice.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedVoice === voice.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedVoice(voice.id)}
                    >
                      <h4 className="font-semibold text-gray-900 text-sm">{voice.name}</h4>
                      <p className="text-xs text-gray-600">{voice.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Prospect Profile */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl">AI Prospect Profile</CardTitle>
                <CardDescription>The AI will simulate this prospect during your call</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Company Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Company Info</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Company:</span>
                        <span className="ml-2 font-medium">TechFlow Solutions</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Industry:</span>
                        <span className="ml-2 font-medium">Software Development</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Size:</span>
                        <span className="ml-2 font-medium">150-200 employees</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Revenue:</span>
                        <span className="ml-2 font-medium">$25M annually</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <span className="ml-2 font-medium">Sarah Mitchell</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Title:</span>
                        <span className="ml-2 font-medium">VP of Operations</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Experience:</span>
                        <span className="ml-2 font-medium">8 years in role</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Communication Style:</span>
                        <span className="ml-2 font-medium">Direct, data-driven</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Challenges */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Current Challenges</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0" />
                        <p className="text-sm text-gray-700">Manual processes causing 30% productivity loss</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0" />
                        <p className="text-sm text-gray-700">Difficulty tracking project timelines and budgets</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0" />
                        <p className="text-sm text-gray-700">Team collaboration issues with remote workforce</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0" />
                        <p className="text-sm text-gray-700">Limited visibility into resource allocation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Simulation Controls */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Simulation Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={startCall}
                  disabled={!selectedCallType}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Simulation
                </Button>
                {!selectedCallType && (
                  <p className="text-xs text-gray-500 text-center">Please select a call type first</p>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Call Duration</span>
                    <span className="font-medium">15 min max</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coaching Mode</span>
                    <span className="font-medium">Post-call</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                </div>

                <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-900">
                  <Settings className="w-4 h-4 mr-2" />
                  Simulation Settings
                </Button>
              </CardContent>
            </Card>

            {/* Coaching Features */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Coaching Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {coachingFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${feature.available ? "bg-green-500" : "bg-yellow-500"}`} />
                      <span className={`text-sm ${feature.available ? "text-gray-900" : "text-gray-600"}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSessions ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                          <div className="text-right space-y-1">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-3 w-8" />
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Skeleton className="h-8 flex-1" />
                          <Skeleton className="h-8 flex-1" />
                          <Skeleton className="h-8 flex-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : savedSessions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No saved sessions yet</p>
                ) : (
                  <div className="space-y-3">
                    {savedSessions.slice(0, 5).map((session) => (
                      <div key={session.callId} className="p-3 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{session.callType}</p>
                            <p className="text-xs text-gray-500">{new Date(session.date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{session.overallScore}/100</p>
                            <p className="text-xs text-gray-500">Score</p>
                          </div>
                        </div>
                        <div className="flex">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => playSession(session)}
                            className="flex-1 h-8 text-xs hover:bg-primary/10 hover:text-primary"
                          >
                            <Play className="h-3 w-3" />
                            Play
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => viewSessionFeedback(session)}
                            className="flex-1 h-8 text-xs hover:bg-primary/10 hover:text-primary"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSession(session.callId)}
                            className="flex-1 h-8 text-xs hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
