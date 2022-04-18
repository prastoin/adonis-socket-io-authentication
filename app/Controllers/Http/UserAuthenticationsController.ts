import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import * as z from 'zod'

export const SignUpUserRequestBody = z.object({
  email: z.string().email(),
  password: z.string().nonempty(),
})
export type SignUpUserRequestBody = z.infer<typeof SignUpUserRequestBody>

export const ApiTokensSignUpUserResponseBody = z.object({
  token: z.string().nonempty(),
})
export type ApiTokensSignUpUserResponseBody = z.infer<typeof ApiTokensSignUpUserResponseBody>

export default class UserAuthenticationsController {
  public async webAuthSignUpUser({ request, auth }: HttpContextContract): Promise<void> {
    const { email, password } = SignUpUserRequestBody.parse(request.body())

    await User.create({
      email,
      password,
    })

    await auth.use('web').attempt(email, password)
  }

  public async apiTokensSignUpUser({
    request,
    auth,
  }: HttpContextContract): Promise<ApiTokensSignUpUserResponseBody> {
    const { email, password } = SignUpUserRequestBody.parse(request.body())

    await User.create({
      email,
      password,
    })

    const { token } = await auth.use('api').attempt(email, password)

    return {
      token,
    }
  }
}
