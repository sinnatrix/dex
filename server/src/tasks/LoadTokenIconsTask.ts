import * as rp from 'request-promise-native'
import * as path from 'path'
import { promisify } from 'util'
import { writeFile } from 'fs'
import { IRadarRelayAsset } from '../types'

export default class LoadTokenIconsTask {
  async run () {
    const assets: IRadarRelayAsset[] = require('../../seeders/assets_mainnet.json')

    const symbols = assets.filter(one => !one.dydx).map(one => one.symbol)

    const folder = path.resolve(__dirname, '../../../app/public/token-icons')

    for (let symbol of symbols) {
      console.log(`Loading icon for ${symbol}...`)
      const uri = `https://storage.googleapis.com/radar-static-assets/token-icons/${symbol}.png`
      const image = await rp({
        uri
      })

      const filepath = path.resolve(folder, `${symbol}.png`)

      await promisify(writeFile)(filepath, image)
      console.log(`Icon for ${symbol} loaded.`)
    }
  }
}
