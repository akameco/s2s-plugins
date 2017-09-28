// @flow
import { relative, normalize, dirname, extname } from 'path'
import flowSyntax from 'babel-plugin-syntax-flow'
import * as t from 'babel-types'
import template from 'babel-template'
import { removeFlowComment, addFlowComment } from 'babel-add-flow-comments'
import globby from 'globby'
import slash from 'slash'
import upperCamelCase from 'uppercamelcase'

type Node = {
  type: string,
  [key: string]: any
}

type Path = {
  type: string,
  node: Node,
  [key: string]: any,
  get(key: string): Node
}

type File = Object

type State = {
  opts: Object,
  file: File
}

const babylonOpts = { sourceType: 'module', plugins: ['flow'] }

const wrapTemp = (tmpl: string) => template(tmpl, babylonOpts)

const createUnion = union =>
  wrapTemp(`export type Action = UNION`)({
    UNION: t.unionTypeAnnotation(union)
  })

function trimExtension(path: string, ext: string = '.js') {
  return extname(path) === ext ? path.replace(ext, '') : path
}

function getImportPath(from: string, to: string): string {
  const relativePath = slash(relative(dirname(from), to))
  const fomattedPath = trimExtension(relativePath)
  if (!/^\.\.?/.test(fomattedPath)) {
    return `./${fomattedPath}`
  }
  return fomattedPath
}

function createActionName(path: string) {
  const parentPath = normalize(dirname(path)).split('/')
  return upperCamelCase(parentPath[parentPath.length - 1]) + 'Action'
}

export default () => {
  return {
    inherits: flowSyntax,
    name: 's2s-action-root',
    visitor: {
      Program: {
        exit(programPath: Path, state: State) {
          const { file } = state
          removeFlowComment(file.ast.comments)
          const { input, output } = state.opts
          const globOptions = Object.assign(
            { absolute: true },
            state.opts.globOptions
          )

          if (!input) {
            throw new Error('require input option')
          }

          if (!output) {
            throw new Error('require output option')
          }

          const files = globby.sync(input, globOptions)

          const imports = files
            .map(f => ({
              source: getImportPath(output, f),
              name: createActionName(f)
            }))
            .map(({ name, source }) => {
              const im = t.importDeclaration(
                [t.importSpecifier(t.identifier(name), t.identifier('Action'))],
                t.stringLiteral(source)
              )
              // $FlowFixMe
              im.importKind = 'type'
              return im
            })

          const union = files
            .map(createActionName)
            .map(name => t.genericTypeAnnotation(t.identifier(name)))

          const action = createUnion(union)

          programPath.node.body = [...imports, t.noop(), action]

          addFlowComment(programPath)
        }
      }
    }
  }
}
