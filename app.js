const htmlStandards = require("reshape-standard");
const cssStandards = require("spike-css-standards");
const jsStandards = require("spike-js-standards");
const pageId = require("spike-page-id");
const Records = require("spike-records");
const env = process.env.SPIKE_ENV;
const https = require("https");
const fs = require("fs");
const locals = {};
let request = require("request");

function getVideoThumbnail() {
  return new Promise((resolve, reject) => {
    fs.readFile("data/site.json", (err, data) => {
      if (err) throw err;
      let obj = JSON.parse(data);
      let videoId = obj.content[0].videoid;
      const url = "" + videoId + ".json";

      request.get(
        "https://api.vimeo.com/videos/" + videoId,
        {
          auth: {
            bearer: "525b876a547a549ea9db0c236918d29b"
          }
        },
        (e, r, body) => {
          if (e) {
            reject(e);
            return;
          }

          let obj = JSON.parse(body);
          let images = JSON.stringify(obj.pictures);
          let items = JSON.parse(images);
          for (let i = 0; i < items.sizes.length; i++) {
            if (items.sizes[i].width >= 1024 && items.sizes[i].width < 1400) {
              obj = {
                title: "vimeo",
                url: items.sizes[i].link
              };

              resolve(obj);
              return;
            }
          }
        }
      );
    });
  });
}

const records = new Records({
  addDataTo: locals,
  site: { file: "data/site.json" },
  video: { callback: getVideoThumbnail },
  analytics: { file: "data/analytics.json" }
});

module.exports = {
  devtool: "source-map",
  ignore: ["**/layout.html", "**/_*", "**/.*", "readme.md", "yarn.lock"],
  reshape: htmlStandards({
    locals: ctx => {
      return (
        ctx,
        Object.assign(
          { pageId: pageId(ctx) },
          { deployVersion: new Date().getTime() },
          locals
        )
      );
    },
    minify: env === "production"
  }),
  postcss: cssStandards({
    minify: env === "production"
  }),
  babel: jsStandards(),
  vendor: ["assets/js/**"],
  plugins: [records]
};
