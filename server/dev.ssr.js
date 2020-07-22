// 热更新
const webpack = require('webpack')
const axios = require('axios')
const MemoryFS = require('memory-fs')
const fs = require('fs')
const path = require('path')
const { minify } = require('html-minifier')
const router = require('express').Router()

//1、webpack配置文件
const webpackConfig = require('@vue/cli-service/webpack.config.js')
const { createBundleRenderer } = require('vue-server-renderer')
//2、编译webpack配置文件
const serverCompiler = webpack(webpackConfig)
const mfs = new MemoryFS()
//指定输出文件到内存流中
serverCompiler.outputFileSystem = mfs

// 3、监听文件修改，实时编译获取最新的 vue-ssr-server-bundle.json
let bundle
serverCompiler.watch({}, (err, stats) => {
  if (err) {
    throw err
  }
  stats = stats.toJson()
  stats.errors.forEach(error => console.error(error))
  stats.warnings.forEach(warn => console.warn(warn))
  const bundlePath = path.join(
    webpackConfig.output.path,
    'vue-ssr-server-bundle.json'
  )
  bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))
  console.log('new bundle generated')
})
// 处理请求
const handleRequest = async (req, res) => {
  console.log('处理请求URL:' + req.url)
  if (!bundle) {
    return res.send('等待webpack打包完成后再访问')
  }
  // 4、获取最新的vue-ssr-client-manifest.json
  const clientManifestResp = await axios.get('http://localhost:8080/vue-ssr-client-manifest.json')
  const clientManifest = clientManifestResp.data

  const renderer = createBundleRenderer(bundle, {
    runInNewContext: false,
    template: fs.readFileSync(path.resolve(__dirname, '../public/index.template.html'), 'utf-8'),
    clientManifest: clientManifest
  })
  const context = {
    title: 'document',
    url: req.url,
    keywords: '',
    description: ''
  }
  // 将Vue 实例渲染为HTML
  renderer.renderToString(context, (err, html) => {
    if (err) {
      return handleError(err)
    }
    res.send(minify(html, { collapseWhitespace: true, minifyCSS: true }))
  })

}

router.get('*', handleRequest)

module.exports = router