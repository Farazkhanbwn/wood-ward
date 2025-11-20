import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '@/lib/api'

interface VoiceMessage {
  speaker: string
  message: string
  timestamp: number
}

interface CoachingNudge {
  message: string
  timestamp: number
}

export function useVoiceCall() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [conversation, setConversation] = useState<VoiceMessage[]>([])
  const [coachingNudges, setCoachingNudges] = useState<CoachingNudge[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const startSession = useCallback(async (topic: string, callType: string) => {
    try {
      setError(null)
      const response = await api.createVoiceSession({
        topic: `${callType}: ${topic}`,
        voice: 'alloy',
        top_k: 5
      })
      
      setSessionId(response.session_id)
      return response.session_id
    } catch (err: any) {
      setError(err.message || 'Failed to start session')
      throw err
    }
  }, [])

  const connectWebSocket = useCallback((sessionId: string) => {
    const wsUrl = api.getVoiceWebSocketUrl(sessionId)
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Handle different message types
        if (data.type === 'transcript') {
          setConversation(prev => [...prev, {
            speaker: data.speaker || 'AI Prospect',
            message: data.text,
            timestamp: Date.now()
          }])
        } else if (data.type === 'coaching') {
          setCoachingNudges(prev => [...prev, {
            message: data.message,
            timestamp: Date.now()
          }])
        } else if (data.type === 'audio') {
          // Play AI audio response
          playAudio(data.audio)
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setError('Connection error occurred')
    }
    
    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    }
    
    wsRef.current = ws
  }, [])

  const playAudio = useCallback((audioData: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }
      
      const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0))
      audioContextRef.current.decodeAudioData(audioBuffer.buffer, (buffer) => {
        const source = audioContextRef.current!.createBufferSource()
        source.buffer = buffer
        source.connect(audioContextRef.current!.destination)
        source.start(0)
      })
    } catch (err) {
      console.error('Error playing audio:', err)
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Convert audio blob to base64 and send via WebSocket
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64Audio = (reader.result as string).split(',')[1]
            wsRef.current?.send(JSON.stringify({
              type: 'audio',
              data: base64Audio
            }))
          }
          reader.readAsDataURL(event.data)
        }
      }
      
      mediaRecorder.start(100) // Send chunks every 100ms
      mediaRecorderRef.current = mediaRecorder
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Microphone access denied')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      mediaRecorderRef.current = null
    }
  }, [])

  const endSession = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    stopRecording()
    setIsConnected(false)
    setSessionId(null)
  }, [stopRecording])

  useEffect(() => {
    return () => {
      endSession()
    }
  }, [endSession])

  return {
    sessionId,
    isConnected,
    conversation,
    coachingNudges,
    error,
    startSession,
    connectWebSocket,
    startRecording,
    stopRecording,
    endSession
  }
}
