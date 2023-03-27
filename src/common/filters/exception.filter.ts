import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    if (status === 400) {
      const errors = {
        errorsMessages: [],
      };
      const responseBody: any = exception.getResponse();

      try {
        responseBody.message.forEach((m) => errors.errorsMessages.push(m));

        response.status(status).send(errors);
      } catch (e) {
        response.status(HttpStatus.BAD_REQUEST).send('Bad Request');
      }
    } else if (status === 500) {
      const responseBody: any = exception.getResponse();
      console.log(responseBody.message)
      // console.log(responseBody.errors)
      return response.sendStatus(400)
    }
    else {
      // response.status(status).json({
      //   statusCode: status,
      //   timestamp: new Date().toISOString(),
      //   path: request.url,
      // });

      response.sendStatus(status);
    }
  }
}
