/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

const AUTHENTICATION_ROUTE_GROUP_PREFIX = '/authentication'
Route.group(() => {
  Route.post('/sign-up/web-auth', 'UserAuthenticationsController.webAuthSignUpUser')
  Route.post('/sign-up/api-tokens', 'UserAuthenticationsController.apiTokensSignUpUser')

  Route.get('is-logged-in', () => {
    return true
  }).middleware('auth:web,api')
}).prefix(AUTHENTICATION_ROUTE_GROUP_PREFIX)

Route.get('/', async () => {
  return { hello: 'world' }
})
