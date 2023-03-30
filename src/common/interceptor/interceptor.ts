import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request: Request = context.switchToHttp().getRequest();
        const reqId = randomUUID();
        const starAt = new Date()

        console.log('', {
            id: reqId,
            method: request.method,
            url: request.url,
            body: request.body,
            startAt: starAt.toLocaleString()
        });
        return next.handle().pipe(
            tap((body) => {
                const response: Response = context.switchToHttp().getResponse();
                const endAt = new Date()
                console.log('', {
                    id: reqId,
                    status: response.statusCode,
                    body,
                    endAt: endAt.toLocaleString(),
                    runtime: endAt.getMilliseconds() - starAt.getMilliseconds()
                });
            }),
        );
    }
}