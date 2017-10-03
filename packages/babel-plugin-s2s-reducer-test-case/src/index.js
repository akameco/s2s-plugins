// @flow
import 'babel-polyfill'
import fs from 'fs'
import * as t from 'babel-types'
import flowSyntax from 'babel-plugin-syntax-flow'
import template from 'babel-template'
import camelCase from 'camelcase'
import looksLike from 'babel-looks-like'
import getReducerCase from 's2s-helper-get-reducer-case'
import getInitialStae from 's2s-helper-get-initial-state'
// import blog from 'babel-log'

/* ::
import type {Path, State} from 's2s-babel-flow-types'
*/

const babylonOpts = { sourceType: 'module', plugins: ['flow'] }

const wrapTemp = (tmpl /* : string */) => template(tmpl, babylonOpts)

const testBuilder = wrapTemp(`
test(TEST_TITLE, () => {
  expect(reducer(initialState, actions.ACTION())).toEqual(STATE)
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

        const code = fs.readFileSync(from, 'utf8')
        const state = getInitialStae(code) || t.nullLiteral()

        function add(actionType /* : string */) {
          rootPath.pushContainer('body', [
            t.noop(),
            testBuilder({
              TEST_TITLE: t.stringLiteral(`handle ${actionType}`),
              ACTION: t.identifier(camelCase(actionType)),
              STATE: state
            })
          ])
        }

        const actions = getReducerCase(code)

        actions.filter(v => !existTestCases.includes(v)).forEach(add)
      }
    }
  }
}
