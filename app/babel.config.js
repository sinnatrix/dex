module.exports = function (api) {
  api.cache(true)

  const presets = ['react-app']
  const plugins = [
    ['@babel/plugin-transform-modules-commonjs', {
      'allowTopLevelThis': true
    }]
  ]

  return {
    presets,
    plugins
  }
}
