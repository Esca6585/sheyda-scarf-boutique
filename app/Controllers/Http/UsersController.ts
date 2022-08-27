import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { languages } from 'Config/languages'
import Category from 'App/Models/Category'
import Product from 'App/Models/Product'

export default class UsersController {
  public async index({ view }: HttpContextContract){
    const categories = Category.query().preload('categories').preload('parent')
    const products = Product.query().preload('category').preload('brand')

    return view.render('user-panel.index', { languages, categories, products })
  }
}
