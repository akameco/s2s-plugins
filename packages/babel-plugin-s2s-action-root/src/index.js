// @flow
import { normalize, dirname } from 'path'
import flowSyntax from 'babel-plugin-syntax-flow'
import * as t from 'babel-types'
import template from 'babel-template'
import { removeFlowComment, addFlowComment } from 'babel-add-flow-comments'
import globby from 'globby'
import upperCamelCase from 'uppercamelcase'
import { getImportPath } from 's2s-utils'
import type { Path, State } from 's2s-babel-flow-types'

const babylonOpts = { sourceType: 'module', plugins: ['flow'] }

const wrapTemp = (tmpl: string) => template(tmpl, babylonOpts)

const createUnion = union =>
  wrapTemp(`export type Action = UNION`)({
    UNION: t.unionTypeAnnotation(union),
  })

const createInitAction = wrapTemp(
  `export type ReduxInitAction = { type: '@@INIT' }`,
)

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
            state.opts.globOptions,
          )

          if (!input) {
            throw new Error('require input option')
          }

          if (!output) {
            throw new Error('require output option')
          }

          const files: string[] = globby.sync(input, globOptions)

          const imports = files
            .map(f => ({
              source: getImportPath(output, f),
              name: createActionName(f),
            }))
            .map(({ name, source }) => {
              const im = t.importDeclaration(
                [t.importSpecifier(t.identifier(name), t.identifier('Action'))],
                t.stringLiteral(source),
              )
              // $FlowFixMe
              im.importKind = 'type'
              return im
            })

          const union = files
            .map(createActionName)
            .map(name => t.genericTypeAnnotation(t.identifier(name)))

          const initAction = 'ReduxInitAction'
          union.unshift(t.genericTypeAnnotation(t.identifier(initAction)))

          const action = createUnion(union)

          programPath.node.body = [
            ...imports,
            t.noop(),
            createInitAction(),
            t.noop(),
            action,
          ]

          addFlowComment(programPath)
        },
      },
    },
  }
}
