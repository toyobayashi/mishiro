const nativeRequire = (relativePath, moduleName) => `require("${relativePath}/${moduleName}-" + process.arch + ".node")`

module.exports = function (relativePath, nativeModules) {
  let externals = {}
  for (const moduleName of nativeModules) {
    externals[moduleName] = nativeRequire(relativePath, moduleName)
  }
  return externals
}
