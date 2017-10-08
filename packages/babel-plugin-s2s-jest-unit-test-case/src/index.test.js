// @flow
import path from 'path'
import pluginTester from 'babel-plugin-tester'
import plugin from '.'

const getFixturesPath = x => path.resolve(__dirname, '__fixtures__', x)

pluginTester({
  title: 'default',
  plugin,
  snapshot: true,
  pluginOptions: { from: getFixturesPath('export-sum.js') },
  tests: [
    `// empty`,
    {
      title: 'when exist test("sum")',
      code: `
    test('sum', () => {
      expect(sum(1, 1)).toBe(2)
    })
    `,
    },
  ],
})

pluginTester({
  title: 'no export',
  plugin,
  snapshot: false,
  pluginOptions: { from: getFixturesPath('no-export-sum.js') },
  tests: [`// empty`],
})

pluginTester({
  plugin,
  tests: [
    {
      title: 'throw error',
      code: `// throw error`,
      error: /required from option/,
    },
  ],
})
