// @flow
import { normalize, dirname } from 'path'
import * as t from 'babel-types'
import { removeFlowComment, addFlowComment } from 'babel-add-flow-comments'
import globby from 'globby'
import upperCamelCase from 'uppercamelcase'
import type { Path, State } from 's2s-babel-flow-types'
import { getImportPath, template } from 's2s-utils'

const createObjectType = input =>
  template(`export type State = STATE`)({
    STATE: t.objectTypeAnnotation(input, null, null),
  })

function getParentDirName(path: string) {
  const parentPath = normalize(dirname(path)).split('/')
  return upperCamelCase(parentPath[parentPath.length - 1])
}

// TODO ignore all syntax error
function inheritsOpts() {
  return {
    manipulateOptions(opts: Object, parserOpts: Object) {
      parserOpts.plugins.push('flow')
      parserOpts.plugins.push('objectRestSpread')
    },
  }
}

export default () => {
  return {
    inherits: inheritsOpts,
    name: 's2s-state-root',
    visitor: {
      Program(programPath: Path, state: State) {
        const { file } = state
        removeFlowComment(file.ast.comments)
        const { input, output } = state.opts
        const globOptions = Object.assign(
          { absolute: true },
          state.opts.globOptions,
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
            name: getParentDirName(f),
          }))
          .map(({ name, source }) => {
            const im = t.importDeclaration(
              [t.importSpecifier(t.identifier(name), t.identifier('State'))],
              t.stringLiteral(source),
            )
            // $FlowFixMe
            im.importKind = 'type'
            return im
          })

        const props = files
          .map(getParentDirName)
          .map(x => t.identifier(x))
          .map(name =>
            t.objectTypeProperty(name, t.genericTypeAnnotation(name)),
          )

        programPath.node.body = [...imports, t.noop(), createObjectType(props)]

        addFlowComment(programPath)
      },
    },
  }
}
