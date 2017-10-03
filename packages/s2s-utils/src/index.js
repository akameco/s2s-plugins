// @flow
import { relative, dirname, extname } from 'path'
import slash from 'slash'

function trimExtension(path /* : string */, ext /* : string */ = '.js') {
  return extname(path) === ext ? path.replace(ext, '') : path
}

export function getImportPath(
  from /* : string */,
  to /* : string */,
) /* : string */ {
  const relativePath = slash(relative(dirname(from), to))
  const fomattedPath = trimExtension(relativePath)
  if (!/^\.\.?/.test(fomattedPath)) {
    return `./${fomattedPath}`
  }
  return fomattedPath
}
