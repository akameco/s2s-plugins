// @flow
import path from 'path'
import pluginTester from 'babel-plugin-tester'
import plugin from '.'

const testWithFixture = (title, fixture) => {
  pluginTester({
    plugin,
    snapshot: true,
    pluginOptions: { from: fixture },
    tests: [
      {
        title,
        fixture,
      },
    ],
  })
}

const getFixturePath = (...x) =>
  path.resolve(__dirname, '..', '__fixtures__', ...x)

testWithFixture('initialStateがある場合', getFixturePath('reducer.js'))
testWithFixture('initialStateがない場合', getFixturePath('reducer-no-state.js'))
