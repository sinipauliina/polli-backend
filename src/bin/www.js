// Module dependencies.
import app from '../app'
import debugLib from 'debug'
import http from 'http'

const debug = debugLib('backend: server')

// Normalize a port into a number, string, or false.
const normalizePort = val => {
  let PORT = parseInt(val, 10)

  if (isNaN(PORT)) {
    // named pipe
    return val
  } else if (PORT >= 0) {
    // port number
    return PORT
  } else {
    return false
  }
}

// Get port from environment and store in Express.
const PORT = normalizePort(process.env.PORT || '3001')
app.set('port', PORT)

// Create HTTP server.
const server = http.createServer(app)

// Event listener for HTTP server "error" event.
const onError = error => {
  if (error.syscall !== 'listen') {
    throw error
  }

  let bind = typeof port === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

// Event listener for HTTP server "listening" event.
const onListening = () => {
  let addr = server.address()
  let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.PORT
  debug(`Listening on ${bind}.`)
}

// Listen on provided port, on all network interfaces.
server.listen(PORT)
console.log(`Backend running on port ${PORT}.`)

server.on('error', onError)
server.on('listening', onListening)
