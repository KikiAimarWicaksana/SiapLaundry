import { io, Socket } from 'socket.io-client'

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

let socket: Socket | null = null

/**
 * Get or create the Socket.io client instance.
 * Configured with auto-reconnect, reconnection delay, and max attempts.
 */
function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })
  }
  return socket
}

/**
 * Connect the socket with an auth token.
 * Sets the token as auth payload and initiates connection.
 */
export function connectSocket(token: string): Socket {
  const s = getSocket()
  s.auth = { token }
  s.connect()
  return s
}

/**
 * Disconnect the socket and clean up.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
  }
}

export { getSocket }
export default getSocket
