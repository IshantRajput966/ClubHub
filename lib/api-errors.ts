// lib/api-errors.ts

/**
 * Standardized API error handling and response formatting for ClubHub.
 *
 * @param {string} message - The error message to return.
 * @param {number} status - The HTTP status code to return.
 * @param {Object} [errors] - Additional error details (optional).
 * @returns {Object} - The standardized error response object.
 */
function apiErrorResponse(message, status, errors = null) {
    return {
        success: false,
        message:
            message || 'An unexpected error occurred.',
        statusCode: status,
        ...(errors ? { errors } : {}),
    };
}

module.exports = apiErrorResponse;
