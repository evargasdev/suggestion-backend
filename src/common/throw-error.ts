import { HttpException, HttpStatus, Logger } from '@nestjs/common';

const logger = new Logger('Throw Error');

interface ErrorPayload {
  statusCode: HttpStatus;
  message: string;
  details?: unknown;
}

export const throwError = (
  statusCode: HttpStatus,
  message: string,
  details?: unknown,
): never => {
  const messageText: string =
    details && typeof details === 'object' && 'message' in details
      ? String((details as Record<string, unknown>).message)
      : message;

  if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
    logger.error(`ERROR: ${JSON.stringify(details, null, 3)}`);
  }

  const payload: ErrorPayload = {
    statusCode,
    message: messageText,
    details: details ?? '',
  };

  throw new HttpException(payload, statusCode);
};

export const throwNotFound = (message: string): never =>
  throwError(HttpStatus.NOT_FOUND, message);

export const throwConflict = (message: string): never =>
  throwError(HttpStatus.CONFLICT, message);

export const throwUnauthorized = (message: string): never =>
  throwError(HttpStatus.UNAUTHORIZED, message);

export const throwBadRequest = (message: string): never =>
  throwError(HttpStatus.BAD_REQUEST, message);
