// @flow
import * as utils from '.'

test('getImportPath same folder', () => {
  const result = utils.getImportPath('path/to/index.js', 'path/to/test.js')
  expect(result).toBe('./test')
})

test('getImportPath same folder when not ext', () => {
  const result = utils.getImportPath('path/to/index', 'path/to/test')
  expect(result).toBe('./test')
})

test('getImportPath parent folder', () => {
  const result = utils.getImportPath('path/to/nest/index.js', 'path/to/test.js')
  expect(result).toBe('../test')
})

test('template', () => {
  const ast = utils.template(`type Action = A`)()
  expect(ast).toMatchSnapshot()
})

test('inheritsOpts', () => {
  const parserOpts = { plugins: [] }
  utils.inheritsOpts().manipulateOptions({}, parserOpts)
  expect(parserOpts).toEqual({ plugins: ['flow', 'objectRestSpread'] })
})

test('return parent path name', () => {})
