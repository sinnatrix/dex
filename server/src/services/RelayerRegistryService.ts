import * as rp from 'request-promise-native'

class RelayerRegistryService {
  async loadRelayers () {
    const items = await rp({
      uri: 'https://api.github.com/repos/0xProject/0x-relayer-registry/contents/relayers.json',
      headers: {
        'User-Agent': 'node:request',
        Accept: 'application/vnd.github-blob.raw'
      },
      json: true
    })

    return items
  }
}

export default RelayerRegistryService
