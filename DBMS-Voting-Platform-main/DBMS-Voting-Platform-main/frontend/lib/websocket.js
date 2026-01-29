'use client'

import { useEffect, useState } from 'react'
import io from 'socket.io-client'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080'

export function useWebSocket(event, callback) {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const newSocket = io(WS_URL, {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('token'),
      },
    })

    newSocket.on('connect', () => {
      console.log('WebSocket connected')
    })

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    if (event && callback) {
      newSocket.on(event, callback)
    }

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [event, callback])

  return socket
}

export function subscribeToResults(pollId, callback) {
  const socket = io(WS_URL, {
    transports: ['websocket'],
    auth: {
      token: localStorage.getItem('token'),
    },
  })

  socket.emit('subscribe-results', { pollId })
  socket.on('results-update', callback)

  return () => {
    socket.emit('unsubscribe-results', { pollId })
    socket.close()
  }
}
