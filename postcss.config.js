module.exports = {
    "plugins": {
      "postcss-pxtorem": {
        rootValue: 192,  
        propList: ['*'],
        selectorBlackList: ['.norem'],
        // exclude: /node_modules/i
        // 过滤掉.norem-开头的class，不进行rem转换
      }
    }
  }
  