import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AdminAuthCheck {
  public async handle({ auth, response, params }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const check = await auth.use('admin').check()

    if(check){
      response.redirect().toRoute('admin.dashboard', { 'locale': params.locale })
    }

    await next()
  }
}
