// @flow
import path from 'path'
import pluginTester from 'babel-plugin-tester'
import plugin from '.'

const fromPath = path.resolve(__dirname, '__fixtures__', 'reducer.js')

pluginTester({
  title: 'default',
  plugin,
  snapshot: true,
  pluginOptions: { from: fromPath },
  tests: [
    {
      title: 'basic',
      code: `
import reducer, {initialState} from './actions'
    `
    },
    {
      title: 'exist test case',
      code: `
import reducer, {initialState} from './actions'
import * as actions from './actions'

test('handle INCREMENT', () => {
  expect(actions.sample()).toEqual(null)
})
    `
    }
  ]
})

pluginTester({
  plugin,
  tests: [
    {
      title: 'throw error',
      code: `// throw error`,
      error: /required from option/
    }
  ]
})
