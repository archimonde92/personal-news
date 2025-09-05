import { CronJob } from "cron";
import { CCronLogger } from "./cron.logger";
import { LibUtils } from "./utils";
type ECronType = "Normal" | "TimeOut"

type CronError = {
    last_occur_at: Date,
    message: string,
    times: number
}
interface ICronMetadata {
    type: ECronType
    name: string
    cron_time: number | string
    last_run_at: Date
    current_run_at: Date
    last_five_run_time_ms: number[]
    last_five_errors: CronError[]
    is_running: boolean
}

interface ICronFunctions {
    run: (first_run?: boolean) => any
    pause: () => Promise<boolean>
    resume: () => Promise<boolean>
}

interface ICron extends ICronMetadata, ICronFunctions { }

abstract class CCron implements ICron {
    protected _trigger_log_interval = 60000
    last_run_at: Date
    last_five_errors: CronError[]
    current_run_at: Date
    last_five_run_time_ms: number[]
    is_running: boolean
    constructor(_trigger_log_interval: number, public type: ECronType, public name: string, public cron_time: number | string) {
        this.last_run_at = new Date()
        this.current_run_at = new Date()
        this.last_five_run_time_ms = []
        this.is_running = true
        this.last_five_errors = []
        this._trigger_log_interval = _trigger_log_interval
    }
    abstract run: (first_run?: boolean) => any
    abstract pause: () => Promise<boolean>;
    abstract resume: () => Promise<boolean>;
    protected errorHandler(error: any) {
        const error_string = LibUtils.ConvertErrorToString(error)
        const found_error = this.last_five_errors.find(el => el.message === error_string)
        if (found_error) {
            found_error.last_occur_at = new Date()
            found_error.times++
        } else {
            this.last_five_errors.unshift({
                last_occur_at: new Date(),
                message: error_string,
                times: 1
            })
            this.last_five_errors.length = Math.min(this.last_five_errors.length, 5)
        }
    }

    public callbackHandler = async (callback: ICronCallback, first_run: boolean) => {
        const start = new Date()
        const is_trigger_log = first_run || ((+this.current_run_at % this._trigger_log_interval) >= (+start % this._trigger_log_interval))
        this.last_run_at = this.current_run_at
        this.current_run_at = start
        try {
            if (is_trigger_log && CCronLogger.info) CCronLogger.info(`Start ${callback.name || 'TestCron'}:${start}`);
            await callback(first_run)
        } catch (error) {
            CCronLogger.error && CCronLogger.error(`${callback.name || 'TestCron'} ${error}`);
            this.errorHandler(error)
        } finally {
            const end = new Date()
            this.last_five_run_time_ms.unshift(end.getTime() - start.getTime())
            this.last_five_run_time_ms.length = Math.min(this.last_five_run_time_ms.length, 5)
            if (is_trigger_log && CCronLogger.info) CCronLogger.info(`Finish ${callback.name || 'TestCron'} running in ${this.last_five_run_time_ms[this.last_five_run_time_ms.length - 1]} ms`);
        }
    }
}

type ICronCallback = (first_run?: boolean) => any

class CTimeOutCron extends CCron {
    private timeoutId?: NodeJS.Timeout

    constructor(private timeout_ms: number, private _callback: ICronCallback, _trigger_log_interval: number = 60000) {
        super(_trigger_log_interval, "TimeOut", _callback.name, timeout_ms)
    }

    run = async (first_run: boolean = true) => {
        if (!this.is_running) return

        await this.callbackHandler(this._callback, first_run)

        if (this.is_running) {
            this.timeoutId = setTimeout(() => this.run(false), this.timeout_ms)
        }
    }

    pause = async () => {
        this.is_running = false
        if (this.timeoutId) {
            clearTimeout(this.timeoutId)
            this.timeoutId = undefined
        }
        return true
    }

    resume = async () => {
        if (!this.is_running) {
            this.is_running = true
            this.run(false)
        }
        return true
    }
}

class CNormalCron extends CCron {
    private _cron: CronJob
    private first_run: boolean = false
    constructor(cron_time: string, private _callback: ICronCallback, _trigger_log_interval: number = 60000) {
        super(_trigger_log_interval, "Normal", _callback.name, cron_time)
        this._cron = new CronJob(cron_time, async () => {
            this.first_run = true
            await this.callbackHandler(this._callback, this.first_run)
        }, null, false, 'UTC', null)
    }
    run = (first_run: boolean = true) => {
        if (!this.is_running) {
            this.is_running = true
        }
        this.first_run = first_run
        this._cron.start()
        this.first_run = false

    }

    pause = async () => {
        this.is_running = false
        this._cron.stop()
        return true
    }

    resume = async () => {
        if (!this.is_running) {
            this.is_running = true
        }
        this.run()
        return true
    }
}

class CCronFactory {
    /**
     * @param cron_time <number> of milliseconds or cron string. Example: 1000 (one second) or '* * * * * * *'
     * @param _callback main function of cron
     * @param _trigger_log_interval trigger log every <number> milliseconds. Default:60000 (60 secconds)
     */
    static createCron(cron_time: number | string, _callback: ICronCallback, _trigger_log_interval: number = 60000): CCron {
        if (typeof cron_time === 'string') return new CNormalCron(cron_time, _callback, _trigger_log_interval)
        if (typeof cron_time === 'number') return new CTimeOutCron(cron_time, _callback, _trigger_log_interval)
        return new CNormalCron(`* * * * *`, _callback, _trigger_log_interval)
    }

    static showCronDetails(crons: CCron[]) {
        const results: ICronMetadata[] = []
        crons.forEach((cron) => {
            const { type,
                name,
                last_run_at,
                current_run_at,
                last_five_run_time_ms,
                is_running,
                last_five_errors,
                cron_time
            } = cron
            results.push({
                type,
                name,
                last_run_at,
                current_run_at,
                last_five_run_time_ms,
                is_running,
                last_five_errors,
                cron_time
            })
        })
        return results
    }
}

export {
    CCron,
    CCronFactory,
    ICronCallback,
    ICronMetadata
};
