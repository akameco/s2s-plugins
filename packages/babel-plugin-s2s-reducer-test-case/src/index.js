// @flow
import 'babel-polyfill'
import fs from 'fs'
import * as t from 'babel-types'
import flowSyntax from 'babel-plugin-syntax-flow'
import template from 'babel-template'
import camelCase from 'camelcase'
import looksLike from 'babel-looks-like'
import getReducerCase from 's2s-helper-get-reducer-case'
// import blog from 'babel-log'

/* ::
type Node = {
  type: string,
  [key: string | number]: any
}

type Path = {
  type: string,
  node: Node,
  [key: string]: any,
  get(key: string): Node
}

type Opts = {
  from: string
}

type State = {
  opts: Opts
}
*/

const babylonOpts = { sourceType: 'module', plugins: ['flow'] }

const wrapTemp = (tmpl /* : string */) => template(tmpl, babylonOpts)

const testBuilder = wrapTemp(`
test(TEST_TITLE, () => {
  expect(actions.ACTION()).toEqual(null)
})
`)

export default () => {
  return {
    inherits: flowSyntax,
    name: 's2s-reducer-test-case',
    visitor: {
      Program(rootPath /* : Path */, { opts: { from } } /* : State */) {
        if (!from) {
          throw new Error('required from option')
        }

        const existTestCases = []
        rootPath.traverse({
          CallExpression(callPath /* : Path */) {
            if (
              looksLike(callPath, {
                node: {
                  callee: { type: 'Identifier', name: 'test' }
                }
              })
            ) {
              const testTitlePath = callPath.get('arguments')[0]
              const value /* : string */ = testTitlePath.get('value').node
              existTestCases.push(value.replace('handle ', ''))
            }
          }
        })

        function add(actionType /* : string */) {
          rootPath.pushContainer('body', [
            t.noop(),
            testBuilder({
              TEST_TITLE: t.stringLiteral(`handle ${actionType}`),
              ACTION: t.identifier(camelCase(actionType))
            })
          ])
        }

        const code = fs.readFileSync(from, 'utf8')
        const actions = getReducerCase(code)

        actions.filter(v => !existTestCases.includes(v)).forEach(add)
      }
    }
  }
}
