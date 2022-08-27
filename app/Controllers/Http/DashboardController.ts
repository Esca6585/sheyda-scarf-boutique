import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { languages } from 'Config/languages'

export default class DashboardController {
  public async index({ view }: HttpContextContract){
    return view.render('admin-panel.dashboard.dashboard', { languages })
  }
}
