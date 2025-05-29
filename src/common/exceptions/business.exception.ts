import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    public userMessage: string,
    public technicalError?: string,
  ) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: userMessage,
        technicalError: technicalError || null,
        error: 'BusinessConflict',
      },
      HttpStatus.CONFLICT,
    );
  }
}
