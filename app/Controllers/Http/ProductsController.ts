import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Product from 'App/Models/Product'
import Category from 'App/Models/Category'
import Brand from 'App/Models/Brand'
import { languages } from 'Config/languages'
import CreateProduct from 'App/Validators/CreateProductValidator'
import { string } from '@ioc:Adonis/Core/Helpers'
import Drive from '@ioc:Adonis/Core/Drive'

export default class ProductsController {
  public async index({ view, request }: HttpContextContract) {
    let pagination = 10;
    let products;

    if(request.input('pagination')){
      pagination = request.input('pagination')
    }

    products = await Product.query().preload('category').preload('brand').orderBy('id', 'desc').paginate(request.input('page'), pagination)

    if(request.ajax()) {
      if(request.input('search')){
        const searchQuery = request.input('search');

        products = await Product.query().preload('category').preload('brand').orderBy('id', 'desc')
                                                .orWhere('name_tm', 'LIKE', '%' + searchQuery + '%')
                                                .orWhere('name_en', 'LIKE', '%' + searchQuery + '%')
                                                .orWhere('name_ru', 'LIKE', '%' + searchQuery + '%')
                                                .orWhere('description', 'LIKE', '%' + searchQuery + '%')
                                                .orWhere('code', 'LIKE', '%' + searchQuery + '%')
                                                .orWhere('sale_type', 'LIKE', '%' + searchQuery + '%')
                                                .paginate(request.input('page'), pagination)

      }

      return view.render('admin-panel.product.product-table', { languages, products, pagination })
    }

    return view.render('admin-panel.product.product', { languages, products, pagination })
  }

  public async create({ view }: HttpContextContract) {
    const product = new Product
    const parentCategories = await Category.all()
    const parentBrands = await Brand.all()

    return view.render('admin-panel.product.product-form', { languages, product, parentCategories, parentBrands })
  }

  public async store({ params, request, session, response }: HttpContextContract) {
    await request.validate(CreateProduct)

    const coverImages = request.files('images', {
      extnames: ['jpg', 'png', 'gif'],
    })

    const product = new Product
    let imageName, path, images = []

    if(coverImages.length) {
      path = "uploads"

      for (let image of coverImages) {
        imageName = string.generateRandom(10) + '.' + image.extname
        image.clientName = imageName

        await image.move(Application.tmpPath(path))
        var pathName = path + '/' + imageName

        images.push(pathName)

        console.log(images)

      }
      product.images = JSON.stringify(images)
    }

    product.name_tm = request.input('name_tm')
    product.name_en = request.input('name_en')
    product.name_ru = request.input('name_ru')
    product.description = request.input('description')
    product.price = request.input('price')
    product.sale_price = request.input('sale_price')
    product.discount = request.input('discount')
    product.sale_type = request.input('sale_type')
    product.color = request.input('color')
    product.stock = request.input('stock')
    product.code = string.generateRandom(10)
    product.category_id = request.input('category_id')
    product.brand_id = request.input('brand_id')

    await product.save()

    session.flash('success-create', 'The resource was created!')
    response.redirect().toRoute('product.index', { 'locale': params.locale })
  }

  public async show({ view, params }: HttpContextContract) {
    const product = await Product.findOrFail(params.id)

    var parentCategory, parentBrand

    if(product.category_id && product.brand_id){
      parentCategory = await Category.findOrFail(product.category_id)
      parentBrand = await Brand.findOrFail(product.brand_id)
    }

    return view.render('admin-panel.product.product-show', { languages, product, parentCategory, parentBrand })
  }

  public async edit({ view, params }: HttpContextContract) {
    const product = await Product.findOrFail(params.id)
    const parentCategories = await Category.all()
    const parentBrands = await Brand.all()

    return view.render('admin-panel.product.product-form', { languages, product, parentCategories, parentBrands })
  }

  public async update({ params, request, session, response }: HttpContextContract) {
    await request.validate(CreateProduct)

    const product = await Product.findOrFail(params.id)

    const coverImages = request.files('images', {
      extnames: ['jpg', 'png', 'gif'],
    })

    let imageName, path, images = []

    if(coverImages.length) {
      this.deleteFunc(product)

      path = "uploads"

      for (let image of coverImages) {
        imageName = string.generateRandom(10) + '.' + image.extname
        image.clientName = imageName

        await image.move(Application.tmpPath(path))
        var pathName = path + '/' + imageName

        images.push(pathName)
      }
      product.images = JSON.stringify(images)
    }

    product.name_tm = request.input('name_tm')
    product.name_en = request.input('name_en')
    product.name_ru = request.input('name_ru')
    product.description = request.input('description')
    product.price = request.input('price')
    product.sale_price = request.input('sale_price')
    product.discount = request.input('discount')
    product.sale_type = request.input('sale_type')
    product.color = request.input('color')
    product.stock = request.input('stock')
    product.code = string.generateRandom(10)
    product.category_id = request.input('category_id')
    product.brand_id = request.input('brand_id')

    await product.save()

    session.flash('success-update', 'The resource was updated!')
    response.redirect().toRoute('product.index', { 'locale': params.locale })
  }

  public async destroy({ params, session, response }: HttpContextContract) {

    const product = await Product.findOrFail(params.id)

    this.deleteFunc(product)

    await product.delete()

    session.flash('success-delete', 'The resource was deleted!')
    response.redirect().toRoute('product.index', { 'locale': params.locale })
  }

  public async deleteFunc(product) {
    if(product.images){
      product.images.forEach(element => {

        const data = element.split('/')

        if(data){
          this.deleteFile(data[data.length-1])
        }
      });
    }
  }

  public async deleteFile(imageName) {
    await Drive.delete(imageName)
  }
}
