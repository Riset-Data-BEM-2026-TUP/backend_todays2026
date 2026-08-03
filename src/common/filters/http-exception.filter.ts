import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let code = 'INTERNAL_ERROR';
    let message = 'Terjadi kesalahan pada server';
    let details: unknown[] = [];

    if (exception instanceof HttpException) {
      const r = exception.getResponse() as any;
      message = typeof r === 'string' ? r : r?.message ?? message;
      code = r?.code ?? (status === 400 ? 'VALIDATION_ERROR' : status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : 'ERROR');
      if (Array.isArray(r?.message)) { details = r.message; message = 'Validasi gagal'; }
    } else {
      // Jangan bocorkan stack trace mentah ke client
      this.logger.error(exception);
    }

    res.status(status).json({ success: false, error: { code, message, details } });
  }
}
