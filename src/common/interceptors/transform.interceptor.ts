import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Bungkus semua response sukses menjadi { success, data, meta } yang konsisten. */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((payload: any) => {
        // Jika handler sudah mengembalikan { data, meta } (mis. berpaginasi), pertahankan.
        if (payload && typeof payload === 'object' && 'data' in payload && 'meta' in payload) {
          return { success: true, ...payload };
        }
        return { success: true, data: payload };
      }),
    );
  }
}
