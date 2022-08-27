import { DateTime } from 'luxon'
import {
  column,
  BaseModel,
  belongsTo,
  BelongsTo,
} from '@ioc:Adonis/Lucid/Orm'
import Category from 'App/Models/Category'
import Brand from 'App/Models/Brand'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name_tm: string

  @column()
  public name_en: string

  @column()
  public name_ru: string

  @column()
  public description: string | null

  @column()
  public price: number

  @column()
  public sale_price: number

  @column()
  public discount: number

  @column()
  public sale_type: string | null

  @column()
  public color: string | null

  @column()
  public stock: number

  @column()
  public code: string

  @column()
  public images: JSON | null

  @column()
  public category_id: number | null

  @column()
  public brand_id: number | null

  @belongsTo(() => Category,{
    localKey: 'id',
    foreignKey: 'category_id',
  })
  public category: BelongsTo<typeof Category>

  @belongsTo(() => Brand,{
    localKey: 'id',
    foreignKey: 'brand_id',
  })
  public brand: BelongsTo<typeof Brand>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
  product: never[]
}
