const htmlStandards = require('reshape-standard')
const cssStandards = require('spike-css-standards')
const jsStandards = require('spike-js-standards')
const pageId = require('spike-page-id')
const Collections = require('spike-collections')
const Records = require('spike-records')
const env = process.env.SPIKE_ENV

const locals = {}
const collections = new Collections({
  addDataTo: locals,
  collections: {
    posts: {
      files: 'posts/**',
      markdownLayout: 'templates/posts/single.html',
      paginate: {
        perPage: 1,
        template: 'templates/posts/post.html',
        output: n => {
          if (n === 1) {
            return `posts/index.html`
          }
          return `posts/${n}.html`
        } 
      }
    }
  }
})
const records = new Records({
  addDataTo: locals,
  site: { file: 'data/site.json' }
  // one: { file: 'data.json' },
  // two: { url: 'http://api.carrotcreative.com/staff' },
  // three: { data: { foo: 'bar' } },
  // four: {
  //   graphql: {
  //     url: 'http://localhost:1234',
  //     query: 'query { allPosts { title } }',
  //     variables: 'xxx', // optional
  //     headers: { authorization: 'Bearer xxx' } // optional
  //   }
  // },
  // five: { callback: myFunc }
});

module.exports = {
  devtool: 'source-map',
  ignore: ['**/layout.html', '**/_*', '**/.*', 'readme.md', 'yarn.lock'],
  reshape: htmlStandards({
    locals: ctx => {
      return collections.locals(ctx, Object.assign({ pageId: pageId(ctx) }, locals))
    },
    minify: env === 'production'
  }),
  postcss: cssStandards({
    minify: env === 'production'
  }),
  babel: jsStandards(),
  vendor: ['assets/js/**'],
  plugins: [collections, records]
}
