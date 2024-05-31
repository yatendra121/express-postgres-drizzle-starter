import type { Request, Response } from 'express';

type HttpErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'NOT_ACCEPTABLE'
  | 'REQUEST_TIMEOUT'
  | 'CONFLICT'
  | 'GONE'
  | 'LENGTH_REQUIRED'
  | 'PRECONDITION_FAILED'
  | 'PAYLOAD_TOO_LARGE'
  | 'URI_TOO_LONG'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'RANGE_NOT_SATISFIABLE'
  | 'EXPECTATION_FAILED'
  | 'TEAPOT';

type BackendErrorCode = 'VALIDATION_ERROR' | 'USER_NOT_FOUND' | 'INVALID_PASSWORD';

type ErrorCode = HttpErrorCode | BackendErrorCode | 'INTERNAL_ERROR';

export const getStatusFromErrorCode = (code: ErrorCode): number => {
  switch (code) {
    case 'BAD_REQUEST':
    case 'VALIDATION_ERROR':
      return 400;
    case 'UNAUTHORIZED':
    case 'INVALID_PASSWORD':
      return 401;
    case 'NOT_FOUND':
    case 'USER_NOT_FOUND':
      return 404;
    case 'METHOD_NOT_ALLOWED':
      return 405;
    case 'NOT_ACCEPTABLE':
      return 406;
    case 'REQUEST_TIMEOUT':
      return 408;
    case 'CONFLICT':
      return 409;
    case 'GONE':
      return 410;
    case 'LENGTH_REQUIRED':
      return 411;
    case 'PRECONDITION_FAILED':
      return 412;
    case 'PAYLOAD_TOO_LARGE':
      return 413;
    case 'URI_TOO_LONG':
      return 414;
    case 'UNSUPPORTED_MEDIA_TYPE':
      return 415;
    case 'RANGE_NOT_SATISFIABLE':
      return 416;
    case 'EXPECTATION_FAILED':
      return 417;
    case 'TEAPOT':
      return 418; // I'm a teapot
    case 'INTERNAL_ERROR':
      return 500;
    default:
      return 500;
  }
};

export const getMessageFromErrorCode = (code: ErrorCode): string => {
  switch (code) {
    case 'BAD_REQUEST':
      return 'The request is invalid.';
    case 'VALIDATION_ERROR':
      return 'The request contains invalid or missing fields.';
    case 'UNAUTHORIZED':
      return 'You are not authorized to access this resource.';
    case 'NOT_FOUND':
      return 'The requested resource was not found.';
    case 'USER_NOT_FOUND':
      return 'The user was not found.';
    case 'INTERNAL_ERROR':
      return 'An internal server error occurred.';
    case 'CONFLICT':
      return 'The request conflicts with the current state of the server.';
    case 'INVALID_PASSWORD':
      return 'The password is incorrect.';
    default:
      return 'An internal server error occurred.';
  }
};

export const handle404Error = (_req: Request, res: Response) => {
  let code: ErrorCode = 'NOT_FOUND';
  res.status(getStatusFromErrorCode(code)).json({
    code: code,
    message: 'Route not found',
    details: 'The route you are trying to access does not exist',
  });
};
