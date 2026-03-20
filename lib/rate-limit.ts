// rate-limit.ts

/**
 * Rate limiter function to limit the number of requests in a given time frame.
 * @param limit - Number of requests allowed.
 * @param interval - Interval in milliseconds.
 */
function rateLimiter(limit: number, interval: number) {
    let requests = 0;
    let startTime = Date.now();

    return function(req: any, res: any, next: any) {
        const currentTime = Date.now();

        // Reset the counter after the interval
        if (currentTime - startTime > interval) {
            requests = 0;
            startTime = currentTime;
        }

        // Check if the limit has been exceeded
        if (requests < limit) {
            requests++;
            next(); // allow request to proceed
        } else {
            res.status(429).send('Too many requests, please try again later.'); // return error
        }
    };
}

export default rateLimiter;
