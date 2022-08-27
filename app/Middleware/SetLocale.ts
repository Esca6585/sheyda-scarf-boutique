import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SetLocale {
  public async handle({ i18n, params }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    i18n.switchLocale(params.locale)

    await next()
  }
}
