/**
 * Builds a consistent JSON envelope for every response.
 *
 *   success(res, data, 'Created', 201)
 *   failure(res, error)
 */

export function success(res, data = null, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null,
  });
}

export function failure(res, message = 'Something went wrong', statusCode = 500, errorDetails = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: errorDetails,
  });
}
