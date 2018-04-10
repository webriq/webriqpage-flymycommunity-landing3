const htmlStandards = require('reshape-standard')
const cssStandards = require('spike-css-standards')
const jsStandards = require('spike-js-standards')
const pageId = require('spike-page-id')
const Records = require('spike-records')
const env = process.env.SPIKE_ENV
const https = require('https')
const fs = require('fs')
const locals = {}


fs.readFile('data/site.json', (err, data) => {
  if(err) throw err;
  let obj = JSON.parse(data);
  let videoId = obj.content[0].videoid;
  const url = 'https://vimeo.com/api/v2/video/'+videoId+'.json'
  https.get(url, res => {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", data => {
      body += data;
    })
    res.on("end", () => {
      body = JSON.parse(body);
      let videoLocation = body[0].thumbnail_large;
      obj = {
        "title": "vimeo",
        "url": videoLocation
      }
      fs.writeFile('data/video.json', JSON.stringify(obj), (err) =>{
        if(err) throw err;
        console.log("File has been saved!")
      })
    })
  })
})



const records = new Records({
  addDataTo: locals,
  site: { file: 'data/site.json' },
  video: { file: 'data/video.json' }
});

module.exports = {
  devtool: 'source-map',
  ignore: ['**/layout.html', '**/_*', '**/.*', 'readme.md', 'yarn.lock'],
  reshape: htmlStandards({
    locals: ctx => {
      return ctx, Object.assign({ pageId: pageId(ctx) }, locals)
    },
    minify: env === 'production'
  }),
  postcss: cssStandards({
    minify: env === 'production'
  }),
  babel: jsStandards(),
  vendor: ['assets/js/**'],
  plugins: [records]
}
