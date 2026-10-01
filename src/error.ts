import { BaseError, HttpRequestError, TimeoutError } from "viem";

function isRetriableStatus(status: number): boolean {
  const retriableCodes: Record<number, boolean> = {
    401: false,
    403: false,
    408: true,
    429: true,
  };

  return retriableCodes[status] ?? false;
}

function isRetriableError(error: unknown): boolean {
  const requestError =
    error instanceof BaseError
      ? error.walk(
          (cause) =>
            cause instanceof TimeoutError || cause instanceof HttpRequestError,
        )
      : error;

  if (requestError instanceof TimeoutError) {
    return true;
  }
  if (requestError instanceof HttpRequestError) {
    if (requestError.status !== undefined) {
      return isRetriableStatus(requestError.status);
    }
  }

  return false;
}

export { isRetriableError };
