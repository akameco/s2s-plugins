// @flow
const helper = require('./').default

test('get initalState', () => {
  const fixture = `
export const initialState = {count: 1}
`

  const actions = helper(fixture)
  expect(actions).toMatchSnapshot()
})

test('get initalState with flow', () => {
  const fixture = `
export const initialState: State = {count: 1}
`

  const actions = helper(fixture)
  expect(actions).toMatchSnapshot()
})

test('not get initalState', () => {
  const fixture = `
export const x = {count: 1}
`

  const actions = helper(fixture)
  expect(actions).toBe(null)
})
