import { errorConsoleLog, successConsoleLog } from "./color-log"

class CCronLogger {
    static info: ((data: any) => void) | null = null
    static error: ((data: any) => void) | null = null
}

CCronLogger.info = successConsoleLog
CCronLogger.error = errorConsoleLog

export {
    CCronLogger
}