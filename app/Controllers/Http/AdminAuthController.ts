import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { languages } from 'Config/languages'

export default class AdminAuthController {
  public async loginShowAdmin({ view }: HttpContextContract) {
    return view.render('auth/admin-login', { languages })
  }

  public async loginAdmin({ request, response, auth, session }: HttpContextContract) {
    // grab uid and password values off request body
    const { uid, password } = request.only(['uid', 'password'])

    try {
      // attempt to login
      await auth.use('admin').attempt(uid, password)
    } catch (error) {
      // if login fails, return vague form message and redirect back
      session.flash('uid', 'Your username, email, or password is incorrect')
      session.flash('password', 'Your username, email, or password is incorrect')
      return response.redirect().back()
    }

    // otherwise, redirect to home page
    return response.redirect('/')
  }

  public async logout({ response, auth }: HttpContextContract) {
    // logout the user
    await auth.use('admin').logout()

    // redirect to login page
    return response.redirect('/')
  }
}

