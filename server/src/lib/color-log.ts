// Define log levels enum for type safety
enum LogLevel {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    DEBUG = 'debug'
}

// Define color codes as a const enum for better performance
const enum ColorCode {
    Reset = '\x1b[0m',
    Bright = '\x1b[1m',
    Dim = '\x1b[2m',
    Underscore = '\x1b[4m',
    Blink = '\x1b[5m',
    Reverse = '\x1b[7m',
    Hidden = '\x1b[8m'
}

// Simplified color configuration
const colours = {
    reset: ColorCode.Reset,
    fg: {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        crimson: '\x1b[38m'
    }
} as const;

// Helper function to format messages
const formatLogMessage = (msg: unknown): string => {
    if (msg instanceof Error) {
        return msg.stack || msg.message;
    }
    return typeof msg === 'object' ? JSON.stringify(msg) : String(msg);
};

// Optimized logging functions
const successConsoleLog = (msg: unknown): void =>
    console.log(colours.fg.green, `✔️ - ${formatLogMessage(msg)}`, colours.reset);

const warningConsoleLog = (msg: unknown): void =>
    console.warn(colours.fg.yellow, `⚠️ - ${formatLogMessage(msg)}`, colours.reset);

const errorConsoleLog = (msg: unknown): void =>
    console.error(colours.fg.red, `❌ - ${formatLogMessage(msg)}`, colours.reset);

const debugLog = (msg: unknown): void =>
    console.debug(colours.fg.crimson, formatLogMessage(msg), colours.reset);

// Improved Logger class
class MyLogger {
    private static activeLevels = new Set<LogLevel>([LogLevel.INFO, LogLevel.WARNING]);
    private static enabled = true;

    static log(level: LogLevel, msg: unknown): void {
        if (!this.enabled || !this.activeLevels.has(level)) return;

        switch (level) {
            case LogLevel.INFO:
                successConsoleLog(msg);
                break;
            case LogLevel.WARNING:
                warningConsoleLog(msg);
                break;
            case LogLevel.ERROR:
                errorConsoleLog(msg);
                break;
            case LogLevel.DEBUG:
                debugLog(msg);
                break;
        }
    }

    static info(msg: unknown): void {
        this.log(LogLevel.INFO, msg);
    }

    static warning(msg: unknown): void {
        this.log(LogLevel.WARNING, msg);
    }

    static error(msg: unknown): void {
        this.log(LogLevel.ERROR, msg);
    }

    static table(data: unknown): void {
        if (this.enabled && this.activeLevels.has(LogLevel.INFO)) {
            console.table(data);
        }
    }

    static toggleEnabled(): boolean {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    static enableLevel(level: LogLevel): void {
        this.activeLevels.add(level);
    }

    static disableLevel(level: LogLevel): void {
        this.activeLevels.delete(level);
    }
}

export { colours, MyLogger, LogLevel, successConsoleLog, warningConsoleLog, errorConsoleLog, debugLog };