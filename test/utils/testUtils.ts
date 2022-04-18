import { assign, createMachine, DoneInvokeEvent, interpret, StateFrom } from 'xstate'

export const BASE_URL = `http://${process.env.HOST!}:${process.env.PORT!}`

//Credit https://github.com/Devessier/xstate-wait-for
const createWaitForMachine = <ExpectReturn>(timeout: number) =>
  createMachine(
    {
      initial: 'tryExpect',

      context: {
        expectReturn: undefined as ExpectReturn | undefined,
      },

      after: {
        TIMEOUT: {
          target: 'cancelled',
        },
      },

      states: {
        tryExpect: {
          initial: 'assert',

          states: {
            assert: {
              invoke: {
                src: 'expect',

                onDone: {
                  target: 'succeeded',

                  actions: assign({
                    expectReturn: (_, { data }: DoneInvokeEvent<ExpectReturn>) => data,
                  }),
                },

                onError: {
                  target: 'debouncing',
                },
              },
            },

            debouncing: {
              after: {
                10: {
                  target: 'assert',
                },
              },
            },

            succeeded: {
              type: 'final',
            },
          },

          onDone: {
            target: 'succeeded',
          },

          on: {
            CANCELLED: {
              target: 'cancelled',
            },
          },
        },

        succeeded: {
          type: 'final',
        },

        cancelled: {
          type: 'final',
        },
      },
    },
    {
      delays: {
        TIMEOUT: timeout,
      },
    }
  )

export async function waitFor<ExpectReturn>(
  expect: () => ExpectReturn | Promise<ExpectReturn>,
  timeout?: number
): Promise<ExpectReturn> {
  try {
    return await new Promise((resolve, reject) => {
      let state: StateFrom<typeof createWaitForMachine>

      interpret(
        createWaitForMachine(timeout ?? 200).withConfig({
          services: {
            expect: async () => {
              return await expect()
            },
          },
        })
      )
        .onTransition((updatedState) => {
          state = updatedState
        })
        .onDone(() => {
          if (state.matches('succeeded')) {
            resolve(state.context.expectReturn as ExpectReturn)

            return
          }

          reject(new AssertionTimeout())
        })
        .start()
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      // Replace err stack with the current stack minus
      // all calls after waitFor function included.
      Error.captureStackTrace(err, waitFor)

      throw err
    }

    throw new Error('Unexpected error occured in waitFor function')
  }
}

export class AssertionTimeout extends Error {
  constructor() {
    super('Assertion timed out')
  }
}
