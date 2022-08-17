const plugins = []
if (process.env.NODE_ENV === 'production') {
// exclude(忽略)
  plugins.push(['transform-remove-console', { 'exclude': ['error', 'warn'] }])
}
module.exports = {
  presets: [
    '@vue/app'
  ],
  plugins
}
