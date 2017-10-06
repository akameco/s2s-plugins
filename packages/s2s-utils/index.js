// @flow
const { relative, dirname, extname } = require('path')
const slash = require('slash')
const babelTemplate = require('babel-template')

exports.getImportPath = getImportPath
exports.template = template
exports.inheritsOpts = inheritsOpts

function trimExtension(path /* : string */, ext /* : string */ = '.js') {
  return extname(path) === ext ? path.replace(ext, '') : path
}

function getImportPath(from /* : string */, to /* : string */) /* : string */ {
  const relativePath = slash(relative(dirname(from), to))
  const fomattedPath = trimExtension(relativePath)
  if (!/^\.\.?/.test(fomattedPath)) {
    return `./${fomattedPath}`
  }
  return fomattedPath
}

function template(code /* : string */, plugins /* :?string[] */ = ['flow']) {
  return babelTemplate(code, { sourceType: 'module', plugins })
}

function inheritsOpts() {
  return {
    manipulateOptions(opts /* : Object */, parserOpts /* : Object */) {
      ;['flow', 'objectRestSpread'].forEach(plugin => {
        parserOpts.plugins.push(plugin)
      })
    },
  }
}
