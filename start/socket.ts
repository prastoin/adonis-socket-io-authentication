import AuthManager from '@ioc:Adonis/Addons/Auth'
import HttpContext from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Ws from 'App/Services/Ws'

Ws.boot()

Ws.io
  .use(async (socket, next) => {
    const apiAuthToken: undefined | string = socket.handshake.auth.Authorization
    if (apiAuthToken) {
      socket.request.headers.authorization = apiAuthToken
    }
    const ctx = HttpContext.create('/', {}, socket.request)
    const auth = AuthManager.getAuthForRequest(ctx)

    const shouldUseApiTokensAuthenticationMode = apiAuthToken !== undefined
    if (shouldUseApiTokensAuthenticationMode) {
      const isAuthenticated = await auth.use('api').check()

      if (isAuthenticated) {
        socket.handshake['user'] = auth.user
        next()
      } else {
        next(new Error('User must be authenticated to perform socket protocol'))
      }
    } else {
      try {
        const readyOnly = true
        await ctx.session.initiate(readyOnly)
        const isAuthenticated = await auth.use('web').check()

        if (isAuthenticated) {
          socket.handshake['user'] = auth.user
          next()
        } else {
          next(new Error('User must be authenticated to perform socket protocol'))
        }
      } catch (e) {
        next(new Error('Adonis session init failed'))
      }
    }
  })
  .on('connection', async (socket) => {
    try {
      const userAuth: User = socket.handshake['user']
      if (!(userAuth instanceof User)) {
        throw new Error('Should never occurs userAuth is not a User model instance')
      }

      console.log(userAuth.email)
      socket.on('GET_ACKNOWLEDGE_SOCKET_CONNECTION', async () => {
        socket.emit('ACKNOWLEDGE_SOCKET_CONNECTION')
      })
    } catch (e) {
      console.error(e)
    }
  })
