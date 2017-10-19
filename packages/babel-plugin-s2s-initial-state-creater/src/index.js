// @flow
import { parseExpression } from 'babylon'
import { inheritsOpts } from 's2s-utils'
import { flowFakerSync } from 'flow-faker'
import type { Path, State } from 's2s-babel-flow-types'

const INITIAL_STATE = 'initialState'

export default () => {
  return {
    inherits: inheritsOpts,
    name: 's2s-initial-state-creater',
    visitor: {
      Program(programPath: Path, state: State) {
        const { opts: { from } } = state
        programPath.traverse({
          VariableDeclarator(nodePath) {
            const idPath = nodePath.get('id')

            if (idPath.node.name !== INITIAL_STATE) {
              return
            }

            const { line, column } = nodePath.get('loc').get('start').node
            const flowInfo = flowFakerSync(from, {
              row: line,
              column: column + 1,
            })

            const newAST = parseExpression(JSON.stringify(flowInfo), {
              plugins: ['flow'],
            })

            nodePath.get('init').replaceWith(newAST)
          },
        })
      },
    },
  }
}
