type ApiErrorDetails = Record<string, unknown> | null

type ApiErrorResponse = {
    success: false
    message: string
    statusCode: number
    errors?: Record<string, unknown>
}

function apiErrorResponse(
    message: string,
    status: number,
    errors: ApiErrorDetails = null,
): ApiErrorResponse {
    return {
        success: false,
        message: message || "An unexpected error occurred.",
        statusCode: status,
        ...(errors ? { errors } : {}),
    }
}

module.exports = apiErrorResponse
