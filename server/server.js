const express = require('express')
const router = express.Router()
const Vue = require('vue')
const fs = require('fs')
const path = require('path')
const { minify } = require('html-minifier')
const { createBundleRenderer } = require('vue-server-renderer')

const resolve = file => path.resolve(__dirname, file)

const renderer = createBundleRenderer(require('../dist/vue-ssr-server-bundle.json'), {
  runInNewContext: false,
  template: fs.readFileSync(resolve('../public/index.template.html'), 'utf-8'),
  clientManifest: require('../dist/vue-ssr-client-manifest.json'),
  basedir: resolve('../dist')
})

router.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  const handleError = err => {
    if (err.url) {
      res.redirect(err.url)
    } else if (err.code === 404) {
      res.status(404).send('404 | Page Not Found')
    } else {
      res.status(500).send('500 | Internal Server Error')
      console.error(`error during render: ${req.url}`)
      console.error(err.stack)
    }
  }
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
})

module.exports = router