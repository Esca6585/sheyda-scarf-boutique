import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { languages } from 'Config/languages'
import User from "App/Models/User";

export default class UserAuthController {
  public async registerShow({ view }: HttpContextContract) {
    return view.render('auth/user-register', { languages })
  }

  public async loginShow({ view }: HttpContextContract) {
    return view.render('auth/user-login', { languages })
  }

  public async register({ request, response, auth }: HttpContextContract) {
    // create validation schema for expected user form data
    const userSchema = schema.create({
      username: schema.string({ trim: true }, [rules.unique({ table: 'users', column: 'username', caseInsensitive: true })]),
      email: schema.string({ trim: true }, [rules.email(), rules.unique({ table: 'users', column: 'email', caseInsensitive: true })]),
      password: schema.string({}, [rules.minLength(8)])
    })

    // get validated data by validating our userSchema
    // if validation fails the request will be automatically redirected back to the form
    const data = await request.validate({ schema: userSchema })

    // create a user record with the validated data
    const user = await User.create(data)

    // login the user using the user model record
    await auth.use('web').login(user)

    // redirect to the login page
    return response.redirect('/')
  }

  public async login({ request, response, auth, session }: HttpContextContract) {
    // grab uid and password values off request body
    const { uid, password } = request.only(['uid', 'password'])

    try {
      // attempt to login
      await auth.use('web').attempt(uid, password)
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
    await auth.use('web').logout()

    // redirect to login page
    return response.redirect().toRoute('user.login.show')
  }

  public async profile({ view }: HttpContextContract) {
    return view.render('auth/user-profile')
  }
}

