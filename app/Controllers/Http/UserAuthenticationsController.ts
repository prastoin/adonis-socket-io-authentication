import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import * as z from 'zod'

export const WebAuthSignUpUserRequestBody = z.object({
  email: z.string().email(),
  password: z.string().nonempty(),
})
export type WebAuthSignUpUserRequestBody = z.infer<typeof WebAuthSignUpUserRequestBody>

export default class UserAuthenticationsController {
  public async webAuthSignUpUser({ request, auth }: HttpContextContract): Promise<void> {
    const { email, password } = WebAuthSignUpUserRequestBody.parse(request.body())

    await User.create({
      email,
      password,
    })

    await auth.use('web').attempt(email, password)
  }
}
