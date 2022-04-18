import AdonisServer from '@ioc:Adonis/Core/Server'
import { Server } from 'socket.io'

export interface AllServerToClientEvents {
  ACKNOWLEDGE_SOCKET_CONNECTION: () => {}
  PONG: () => {}
}

export interface AllClientToServerEvents {
  GET_ACKNOWLEDGE_SOCKET_CONNECTION: () => {}
  WEB_AUTH_PING: () => {}
}

export type TypedServerSocket = Server<AllClientToServerEvents, AllServerToClientEvents>

class Ws {
  public io: TypedServerSocket
  private booted = false

  public boot() {
    /**
     * Ignore multiple calls to the boot method
     */
    if (this.booted) {
      return
    }

    this.booted = true
    this.io = new Server(AdonisServer.instance, {
      cors: {
        origin: true,
        credentials: true,
      },
    })
  }
}

export default new Ws()
