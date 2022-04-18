import faker from '@faker-js/faker'
import Database from '@ioc:Adonis/Lucid/Database'
import { SignUpUserRequestBody } from 'App/Controllers/Http/UserAuthenticationsController'
import test from 'japa'
import { io } from 'socket.io-client'
import supertest from 'supertest'
import {
  BASE_URL,
  createSpyOnClientSocketEvent,
  TypedClientSocket,
  waitFor,
} from './utils/testUtils'

test.group('Web auth socket io authentication tests group', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('It should fail to perform a socket connection with invalid web auth cookies', async (assert) => {
    const socket: TypedClientSocket = io(BASE_URL, {
      extraHeaders: {
        Cookie: faker.datatype.uuid(),
      },
      withCredentials: true,
    })

    const socketCreationAcknowledgementSpy = createSpyOnClientSocketEvent(
      socket,
      'ACKNOWLEDGE_SOCKET_CONNECTION'
    )

    try {
      await waitFor(() => {
        socket.emit('GET_ACKNOWLEDGE_SOCKET_CONNECTION')
        assert.isTrue(socketCreationAcknowledgementSpy.called)
      })
    } catch {
      assert.isFalse(socket.connected)
    }
  })

  test('It should be able to perform a socket connection using web auth cookies', async (assert) => {
    const request = supertest.agent(BASE_URL)

    const signUpResponse = await request
      .post('/authentication/sign-up/web-auth')
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
      } as SignUpUserRequestBody)
      .expect(200)

    /**
     * In tests we will have to extract the set-cookie header from the http authenticated response as we cannot
     * persist an initial request instance to socket-io
     * 
     * ResponseSetCookies example
     * {
            responseSetCookies: [
                'remember_web=eyJtZXNzYWdlIjoiIn0; Max-Age=-1; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
                'adonis-session=s%3AeyJtZXNzYWdlIjoiY2wwcXFoc3liMDAwMmpjcG84Y2pnZTgzdSIsInB1cnBvc2UiOiJhZG9uaXMtc2Vzc2lvbiJ9.YpAOIM_0iHXoFKjjpNyF-SLvfOWw1NuPzSt5q2V3T7E; Max-Age=7200; Path=/; HttpOnly',
                'cl0qqhsyb0002jcpo8cjge83u=e%3AyFGWy7ps6TI9kMLsR9ophsQf7reC-CH-tX9Ysjk3hOZkKtNdwLdxzIGn0KFK2KxH-qij1ApKpBpEuUvcGzTvy7vmPScRt06ynRKjKKhlUfmOBg1EtSTy-G0pF3BDe9kzM0yeKf-uXpJt528h1X4IDw.V09jeVo4eVRMMGg1eWl2Mw.Pabq1W6Vo0h21rhurMDnxHCdkTwJpGO3_dcBv6k2kHk; Max-Age=7200; Path=/; HttpOnly'
            ]
        }
     */

    const rawResponseSetCookies: string[] = signUpResponse.header['set-cookie']
    const cookies = rawResponseSetCookies.map((cookie) => cookie.split(';')[0]).join(';')
    console.log({ cookies })

    const socket: TypedClientSocket = io(BASE_URL, {
      extraHeaders: {
        Cookie: cookies,
      },
      withCredentials: true,
    })

    const socketCreationAcknowledgementSpy = createSpyOnClientSocketEvent(
      socket,
      'ACKNOWLEDGE_SOCKET_CONNECTION'
    )
    await waitFor(() => {
      socket.emit('GET_ACKNOWLEDGE_SOCKET_CONNECTION')
      assert.isTrue(socketCreationAcknowledgementSpy.called)
    })
  })
})
