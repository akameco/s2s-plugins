// @flow
import { getImportPath, template } from '.'

test('getImportPath same folder', () => {
  const result = getImportPath('path/to/index.js', 'path/to/test.js')
  expect(result).toBe('./test')
})

test('getImportPath same folder when not ext', () => {
  const result = getImportPath('path/to/index', 'path/to/test')
  expect(result).toBe('./test')
})

test('getImportPath parent folder', () => {
  const result = getImportPath('path/to/nest/index.js', 'path/to/test.js')
  expect(result).toBe('../test')
})

test('template', () => {
  const ast = template(`type Action = A`)()
  expect(ast).toMatchSnapshot()
})
