import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let error = 'Internal Server Error';
    let message: string | string[] = 'Internal server error';

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      error = this.getHttpErrorLabel(status);
    } else if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const responseMessage = (
        exceptionResponse as { message: string | string[] }
      ).message;
      const responseError = (exceptionResponse as { error?: string }).error;

      message = responseMessage;
      error = responseError ?? this.getHttpErrorLabel(status);
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private getHttpErrorLabel(status: number): string {
    return HttpStatus[status] ?? 'Error';
  }
}
