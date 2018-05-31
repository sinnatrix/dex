const rp = require('request-promise-native')


const load = async () => {

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


module.exports = {
  load
}