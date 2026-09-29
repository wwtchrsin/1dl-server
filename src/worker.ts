
import { deleteExpiredMessages } from "./worker-tasks"
import logger from "./lib/logger"

export default () => {
  type Timerids = {
    deleteExpiredMessages: ReturnType<typeof setInterval> | undefined,
  }
  let timerids: Timerids = {
    deleteExpiredMessages: undefined,
  }
  return {
    start: (interval: number) => {
      let tasks = {
        deleteExpiredMessages: async () => {
          try {
            await deleteExpiredMessages()
          } catch (error) {
            logger.info({ error }, "worker/deleteExpiredMessage#Error")
          } finally {
            timerids.deleteExpiredMessages = 
              setTimeout(tasks.deleteExpiredMessages, interval * 1000)
          }
        }
      }
      tasks.deleteExpiredMessages()
    },
    stop: () => {
      if ( timerids.deleteExpiredMessages !== undefined ) {
        clearTimeout(timerids.deleteExpiredMessages)
        timerids.deleteExpiredMessages = undefined
      }
    }
  }
}