let fs = require('fs');
// import path from 'path';
let path = require('path');

// 引入css 单独打包插件
let ExtractTextPlugin = require("extract-text-webpack-plugin");

// 设置生成css 的路径和文件名，会自动将对应entry入口js文件中引入的CSS抽出成单独的文件
let packCSS = new ExtractTextPlugin('./css/[name].min.css');

//webpack自动生成html
let HtmlWebpackPlugin = require('html-webpack-plugin');

function getPages() {
  let pages = ["common"];
  let directories = fs.readdirSync(__dirname+"/src/app");
  for (let dir of directories) {
      if (!dir.startsWith('.')) {
          pages.push(dir);
      }
  }
  return pages;
}

function getEntries(pages) {
    let entries = {};
    for (let page of pages) {
        let key = page === "common" ? page : `app/${page}`;
        let value = `./src/${key}/index.js`;
        entries[key] = value;
    }
    return entries;
}



function getHtmlPlugins(pages) {
  let htmlPlugins = [];
  for (let page of pages) {
    if (page !== 'common') {

      let temp = new HtmlWebpackPlugin({
        filename: `${__dirname}/src/app/${page}/index.html`,
        template: `${__dirname}/src/template/index.ejs`,
        inject:true,    //允许插件修改哪些内容，包括head与body
        hash:true,    //为静态资源生成hash值
        minify:{    //压缩HTML文件
          removeComments:true,    //移除HTML中的注释
          collapseWhitespace:true    //删除空白符与换行符
        },
        chunks: ['common', `app/${page}`],
        title: page
      })
      htmlPlugins.push(temp);
    }
  }
  return htmlPlugins;
}


function fileMappingPlugin() {
    this.plugin("done", function (stats) {
        let output = {};
        let assetsByChunkName = stats.toJson().assetsByChunkName;

        for (let chunkName in assetsByChunkName) {
            let chunkValue = assetsByChunkName[chunkName];

            // Webpack outputs an array for each chunkName when using sourcemaps and some plugins
            if (chunkValue instanceof Array) {
                for (let i = 0; i < chunkValue.length; i++) {
                    let asset = chunkValue[i];
                    if (asset.slice(0,1) !== '.') {
                      let originalPath = `${asset.split(".")[0]}.${asset.split(".")[2]}`;
                      output["/build/" + originalPath] = "/build/" + asset;
                    }
                }
            } else {
                let originalPath =`${chunkValue.split(".")[0]}.${chunkValue.split(".")[2]}`;
                output["/build/" + originalPath] = "/build/" + chunkValue;
            }
        }
        fs.writeFileSync(
            path.join(__dirname, "webpack-assets.json"),
            JSON.stringify(output)
        );
    })
}


const config = {

  entry: getEntries(getPages()),
  output: {
    filename: '[name].[hash].js',
    path: __dirname + '/build'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract('css-loader!sass-loader')
      },{
            test: /\.js$/,
            loader: "babel-loader",
            exclude: /node_modules/
      }
    ]
  },
  plugins: [
    packCSS,
    ...getHtmlPlugins(getPages()),
    fileMappingPlugin
  ]
};

module.exports = config;
