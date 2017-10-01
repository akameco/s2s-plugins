// @flow
const helper = require('./').default

test('get Actions', () => {
  const fixture = `
export default function(state, action) {
  switch(action.type) {
    case Actions.INCREMENT:
      return { count: state + 1}
    case Actions.DECREMENT:
      return { count: state - 1}
    default:
      return state
  }
}
`

  const actions = helper(fixture)
  expect(actions).toEqual(['INCREMENT', 'DECREMENT'])
})

test('ignore other actions', () => {
  const fixture = `
import OtherActions from '../other/actions'

export default function(state, action) {
  switch(action.type) {
    case Actions.INCREMENT:
      return { count: state + 1}
    case Actions.DECREMENT:
      return { count: state - 1}
    case OtherActions.INCREMENT:
      return { count: state + 1}
    default:
      return state
  }
}
`

  const actions = helper(fixture)
  expect(actions).toEqual(['INCREMENT', 'DECREMENT'])
})
