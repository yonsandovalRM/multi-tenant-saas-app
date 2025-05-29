import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { MongooseError } from 'mongoose';
import { MongoServerError } from 'mongodb';

@Catch(MongooseError, MongoServerError)
export class MongooseErrorFilter extends BaseExceptionFilter {
  catch(exception: MongooseError | MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception.name === 'ValidationError') {
      // Para errores de validación de Mongoose
      const errors: Record<string, string> = {};
      const validationError = exception as any;
      for (const field in validationError.errors) {
        if (validationError.errors[field]?.message) {
          errors[field] = validationError.errors[field].message;
        }
      }

      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors,
      });
    } else if (
      (exception as MongoServerError).code === 11000 ||
      exception.message?.includes('E11000 duplicate key error')
    ) {
      // Para errores de clave duplicada (MongoDB)
      const duplicateError = exception as MongoServerError;
      const key = Object.keys(duplicateError.keyValue)[0];
      const value = duplicateError.keyValue[key];

      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: `Duplicate key error: ${key} "${value}" already exists`,
        key,
        value,
      });
    } else {
      // Otros errores se delegan al filtro base
      super.catch(exception, host);
    }
  }
}
