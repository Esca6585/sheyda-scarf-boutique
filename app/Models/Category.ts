import { DateTime } from 'luxon'
import {
  column,
  BaseModel,
  belongsTo,
  BelongsTo,
  hasMany,
  HasMany,
} from '@ioc:Adonis/Lucid/Orm'

export default class Category extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name_tm: string

  @column()
  public name_en: string

  @column()
  public name_ru: string

  @column()
  public icon_name: string | null

  @column()
  public image: string | null

  @column()
  public category_id: number | null

  @belongsTo(() => Category,{
    localKey: 'id',
    foreignKey: 'category_id',
  })
  public parent: BelongsTo<typeof Category>

  @hasMany(() => Category,{
    localKey: 'id',
    foreignKey: 'category_id',
  })
  public categories: HasMany<typeof Category>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
