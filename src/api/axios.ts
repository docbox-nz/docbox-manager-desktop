import { isAxiosError } from "axios";

export function getAPIErrorMessage(error: any): string {
  const message = getAPIErrorMessageInner(error);
  if (message === "null") {
    return "Something went wrong";
  }

  if (message === "Network Error") {
    return "Service unavailable, unreachable, or timed out";
  }

  return message;
}

function getAPIErrorMessageInner(error: any): string {
  if (isAxiosError(error)) {
    if (error.response && error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    if (error.response && error.response.data && error.response.data.reason) {
      return error.response.data.reason;
    }

    if (error.response && typeof error.response.data === "string") {
      return error.response.data;
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Something went wrong";
}
