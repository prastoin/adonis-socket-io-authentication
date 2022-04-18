import faker from '@faker-js/faker'
import Database from '@ioc:Adonis/Lucid/Database'
import { WebAuthSignUpUserRequestBody } from 'App/Controllers/Http/UserAuthenticationsController'
import test from 'japa'
import supertest from 'supertest'
import { BASE_URL } from './utils/testUtils'

test.group('Authentication sign up tests group', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('It should reject unauthentication user on guarded http route', async () => {
    const request = supertest.agent(BASE_URL)

    await request.get('/authentication/is-logged-in').expect(401)
  })

  test('It should sign up user using web auth', async () => {
    const request = supertest.agent(BASE_URL)
    await request
      .post('/authentication/sign-up/web-auth')
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
      } as WebAuthSignUpUserRequestBody)
      .expect(200)

    await request.get('/authentication/is-logged-in').expect(200)
  })
})
