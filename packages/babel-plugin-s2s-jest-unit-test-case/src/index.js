// @flow
import fs from 'fs'
import * as t from 'babel-types'
import { parse } from 'babylon'
import traverse from 'babel-traverse'
import { inheritsOpts, template } from 's2s-utils'
import flatten from 'lodash.flatten'
// import blog from 'babel-log'

/* ::
import type {Path, State} from 's2s-babel-flow-types'
*/

const builder = {
  test: template(`test(TITLE, () => {
    const result = FUNC()
    expect(result).toBe(null)
  })`),
}

const getFuncNames = (code /* :string */) => {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['flow', 'objectRestSpread'],
  })

  const names /* :string[] */ = []

  traverse(ast, {
    FunctionDeclaration(path) {
      if (!path.findParent(p => p.isExportDeclaration())) {
        return
      }
      const name = path.get('id').node.name
      names.push(name)
    },
  })

  return names
}

export default () => {
  return {
    inherits: inheritsOpts(),
    name: 's2s-jest-unit-test-case',
    visitor: {
      Program(rootPath /* : Path */, { opts: { from } } /* : State */) {
        if (!from) {
          throw new Error('required from option')
        }

        const code = fs.readFileSync(from, 'utf8')
        const names /* : Set<string> */ = new Set(getFuncNames(code))

        rootPath.traverse({
          CallExpression(path) {
            const name = path.get('callee').node.name
            names.delete(name)
          },
        })

        const asts = Array.from(names).map(name => [
          t.noop(),
          builder.test({
            TITLE: t.stringLiteral(name),
            FUNC: t.identifier(name),
          }),
        ])

        rootPath.pushContainer('body', flatten(asts))
      },
    },
  }
}
