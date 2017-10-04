// @flow
import { normalize, dirname } from 'path'
import * as t from 'babel-types'
import { removeFlowComment, addFlowComment } from 'babel-add-flow-comments'
import globby from 'globby'
import upperCamelCase from 'uppercamelcase'
import type { Path, State } from 's2s-babel-flow-types'
import { getImportPath, template } from 's2s-utils'

const builders = {
  redux: template(`import { combineReducers } from 'redux'`),
  root: template(`export default combineReducers(OBJ)`),
}

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
    name: 's2s-reducer-root',
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
            return t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier(name))],
              t.stringLiteral(source),
            )
          })

        const props = files
          .map(getParentDirName)
          .map(x => t.identifier(x))
          .map(name => t.objectProperty(name, name, false, true))

        programPath.node.body = [
          builders.redux({}),
          ...imports,
          t.noop(),
          builders.root({ OBJ: t.objectExpression(props) }),
        ]

        addFlowComment(programPath)
      },
    },
  }
}
