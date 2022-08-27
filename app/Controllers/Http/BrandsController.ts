import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Brand from 'App/Models/Brand'
import Category from 'App/Models/Category'
import { languages } from 'Config/languages'
import CreateBrand from 'App/Validators/CreateBrandValidator'
import { string } from '@ioc:Adonis/Core/Helpers'
import Drive from '@ioc:Adonis/Core/Drive'

export default class BrandsController {
  public async index({ view, request }: HttpContextContract) {
    let pagination = 10;
    let brands;

    if(request.input('pagination')){
      pagination = request.input('pagination')
    }

    brands = await Brand.query().preload('category').orderBy('id', 'desc').paginate(request.input('page'), pagination)

    if(request.ajax()) {
      if(request.input('search')){
        const searchQuery = request.input('search');
        brands = await Brand.query().preload('category').orderBy('id', 'desc').where('name', 'LIKE', '%' + searchQuery + '%').paginate(request.input('page'), pagination)
      }

      return view.render('admin-panel.brand.brand-table', { languages, brands, pagination })
    }

    return view.render('admin-panel.brand.brand', { languages, brands, pagination })
  }

  public async create({ view, params }: HttpContextContract) {
    const brand = new Brand
    const parentCategories = await Category.all()

    return view.render('admin-panel.brand.brand-form', { languages, brand, parentCategories })
  }

  public async store({ params, request, session, response }: HttpContextContract) {
    await request.validate(CreateBrand)

    const coverImage = request.file('image', {
      extnames: ['jpg', 'png', 'gif'],
    })

    const brand = new Brand
    let imageName, path

    if (coverImage) {
      path = "uploads"
      imageName = string.generateRandom(10) + '.' + coverImage.extname
      coverImage.clientName = imageName

      await coverImage.move(Application.tmpPath(path))

      brand.image = path + '/' + imageName
    }

    brand.name = request.input('name')
    brand.category_id = request.input('category_id')

    await brand.save()

    session.flash('success-create', 'The resource was created!')
    response.redirect().toRoute('brand.index', { 'locale': params.locale })
  }

  public async show({ view, params }: HttpContextContract) {
    const brand = await Brand.findOrFail(params.id)
    var parentCategory;
    if(brand.category_id){
      parentCategory = await Category.findOrFail(brand.category_id)
    }

    return view.render('admin-panel.brand.brand-show', { languages, brand, parentCategory })
  }

  public async edit({ view, params }: HttpContextContract) {
    const brand = await Brand.findOrFail(params.id)
    const parentCategories = await Category.all()

    return view.render('admin-panel.brand.brand-form', { languages, brand, parentCategories })
  }

  public async update({ params, request, session, response }: HttpContextContract) {
    await request.validate(CreateBrand)

    const brand = await Brand.findOrFail(params.id)

    const coverImage = request.file('image', {
      extnames: ['jpg', 'png', 'gif'],
    })

    let imageName, path

    if(coverImage) {
      const data = brand.image?.split('/')

      if(data){
        this.deleteFile(data[data.length-1])
      }

      path = "uploads"
      imageName = string.generateRandom(10) + '.' + coverImage.extname
      coverImage.clientName = imageName

      await coverImage.move(Application.tmpPath(path))

      brand.image = path + '/' + imageName
    }

    brand.name = request.input('name')
    brand.category_id = request.input('category_id')

    brand.save()

    session.flash('success-update', 'The resource was updated!')
    response.redirect().toRoute('brand.index', { 'locale': params.locale })
  }

  public async destroy({ params, session, response }: HttpContextContract) {

    const brand = await Brand.findOrFail(params.id)

    const data = brand.image?.split('/')

    if(data){
      this.deleteFile(data[data.length-1])
    }

    await brand.delete()

    session.flash('success-delete', 'The resource was deleted!')
    response.redirect().toRoute('brand.index', { 'locale': params.locale })
  }

  public async deleteFile(imageName) {
    await Drive.delete(imageName)
  }
}
