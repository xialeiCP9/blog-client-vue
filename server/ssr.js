// 执行文件，package.json 中脚本执行
const express = require('express')
const path = require('path')
const app = express()

const isDev = process.env.NODE_ENV !== 'production'
// 开发环境执行热更新，产品环境直接获取文件
const router = isDev ? require('./dev.ssr') : require('./server')

app.use(router)

app.use(express.static(path.join(__dirname, 'dist')))

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`server started at localhost: ${port}`)
})