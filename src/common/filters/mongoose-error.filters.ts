import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { MongooseError } from 'mongoose';

@Catch(MongooseError)
export class MongooseErrorFilter extends BaseExceptionFilter {
  catch(exception: MongooseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception.name === 'ValidationError') {
      const errors = {};
      console.log(exception);
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
      });
    } else {
      super.catch(exception, host);
    }
  }
}
