import faker from '@faker-js/faker'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  ApiTokensSignUpUserResponseBody,
  SignUpUserRequestBody,
} from 'App/Controllers/Http/UserAuthenticationsController'
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

  test('It should fail to perform a socket connection with invalid api tokens token', async (assert) => {
    const socket: TypedClientSocket = io(BASE_URL, {
      auth: {
        Authorization: `Bearer ${faker.datatype.uuid()}`,
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
    const rawResponse = await supertest(BASE_URL)
      .post('/authentication/sign-up/api-tokens')
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
      } as SignUpUserRequestBody)
      .expect(200)
    const { token } = ApiTokensSignUpUserResponseBody.parse(rawResponse.body)

    const socket: TypedClientSocket = io(BASE_URL, {
      withCredentials: true,
      auth: {
        Authorization: `Bearer ${token}`,
      },
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
