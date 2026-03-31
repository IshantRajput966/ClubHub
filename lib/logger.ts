// lib/logger.ts

class Logger {
    private static formatMessage(level: string, message: string): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    }

    public static info(message: string): void {
        console.log(this.formatMessage('info', message));
    }

    public static warn(message: string): void {
        console.warn(this.formatMessage('warn', message));
    }

    public static error(message: string): void {
        console.error(this.formatMessage('error', message));
    }
}

// Example Usage
// Logger.info('This is an informational message.');
// Logger.warn('This is a warning message.');
// Logger.error('This is an error message.');

export default Logger;