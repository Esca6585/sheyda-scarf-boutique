import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Category from 'App/Models/Category'
import { languages } from 'Config/languages'
import CreateCategory from 'App/Validators/CreateCategoryValidator'
import { string } from '@ioc:Adonis/Core/Helpers'
import Drive from '@ioc:Adonis/Core/Drive'

export default class CategoriesController {
  public async index({ view, params, request }: HttpContextContract) {
    var pagination = 10;
    var categories;

    if(request.input('pagination')){
      pagination = request.input('pagination')
    }

    if(params.type == 'all'){
      categories = await Category.query().preload('parent').orderBy('id', 'desc').paginate(request.input('page'), pagination)
    } else if(params.type == 'parent'){
      categories = await Category.query().preload('parent').whereNull('category_id').orderBy('id', 'desc').paginate(request.input('page'), pagination)
    } else if(params.type == 'sub'){
      categories = await Category.query().preload('parent').whereNotNull('category_id').orderBy('id', 'desc').paginate(request.input('page'), pagination)
    }

    if(request.ajax()) {
      if(request.input('search')){
        const searchQuery = request.input('search');
        categories = await Category.query().preload('parent').orderBy('id', 'desc').orWhere('name_tm', 'LIKE', '%' + searchQuery + '%').orWhere('name_en', 'LIKE', '%' + searchQuery + '%').orWhere('name_ru', "LIKE", '%' + searchQuery + '%').paginate(request.input('page'), pagination)
      }

      return view.render('admin-panel.category.category-table', { languages, type: params.type, categories, pagination })
    }

    return view.render('admin-panel.category.category', { languages, type: params.type, categories, pagination })
  }

  public async create({ view, params }: HttpContextContract) {
    const category = new Category
    const parentCategories = await Category.all()

    return view.render('admin-panel.category.category-form', { languages, type: params.type, category, parentCategories })
  }

  public async store({ params, request, session, response }: HttpContextContract) {
    await request.validate(CreateCategory)

    const coverImage = request.file('image', {
      extnames: ['jpg', 'png', 'gif'],
    })

    const category = new Category()
    let imageName, path

    if (coverImage) {
      path = "uploads"
      imageName = string.generateRandom(10) + '.' + coverImage.extname
      coverImage.clientName = imageName

      await coverImage.move(Application.tmpPath(path))

      category.image = path + '/' + imageName
    }

    category.name_tm = request.input('name_tm')
    category.name_en = request.input('name_en')
    category.name_ru = request.input('name_ru')
    category.icon_name = request.input('icon_name')
    category.category_id = request.input('category_id')

    await category.save()

    session.flash('success-create', 'The resource was created!')
    response.redirect().toRoute('category.index', { 'locale': params.locale, 'type': params.type })
  }

  public async show({ view, params }: HttpContextContract) {
    const category = await Category.findOrFail(params.id)
    var parentCategory;
    if(category.category_id){
      parentCategory = await Category.findOrFail(category.category_id)
    }

    return view.render('admin-panel.category.category-show', { languages, type: params.type, category, parentCategory })
  }

  public async edit({ view, params }: HttpContextContract) {
    const category = await Category.findOrFail(params.id)
    const parentCategories = await Category.all()

    return view.render('admin-panel.category.category-form', { languages, type: params.type, category, parentCategories })
  }

  public async update({ params, request, session, response }: HttpContextContract) {
    await request.validate(CreateCategory)

    const category = await Category.findOrFail(params.id)

    const coverImage = request.file('image', {
      extnames: ['jpg', 'png', 'gif'],
    })

    let imageName, path

    if(coverImage) {
      const data = category.image?.split('/')

      if(data){
        this.deleteFile(data[data.length-1])
      }

      path = "uploads"
      imageName = string.generateRandom(10) + '.' + coverImage.extname
      coverImage.clientName = imageName

      await coverImage.move(Application.tmpPath(path))

      category.image = path + '/' + imageName
    }

    category.name_tm = request.input('name_tm')
    category.name_en = request.input('name_en')
    category.name_ru = request.input('name_ru')
    category.icon_name = request.input('icon_name')
    category.category_id = request.input('category_id')

    category.save()

    session.flash('success-update', 'The resource was updated!')
    response.redirect().toRoute('category.index', { 'locale': params.locale, 'type': params.type })
  }

  public async destroy({ params, session, response }: HttpContextContract) {

    const category = await Category.findOrFail(params.id)

    const data = category.image?.split('/')

    if(data){
      this.deleteFile(data[data.length-1])
    }

    await category.delete()

    session.flash('success-delete', 'The resource was deleted!')
    response.redirect().toRoute('category.index', { 'locale': params.locale, 'type': params.type })
  }

  public async deleteFile(imageName) {
    await Drive.delete(imageName)
  }
}
