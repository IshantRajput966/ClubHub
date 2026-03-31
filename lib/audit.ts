// audit.ts

/**
 * Audit logging functionality
 */

class Audit {
    log(message: string): void {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`);
    }

    logError(error: string): void {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ERROR: ${error}`);
    }
}

const audit = new Audit();

export default audit;