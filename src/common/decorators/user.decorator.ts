import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator(
  (data: string, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.userId) {
      return null;
    }

    return request.userId;
  },
);

export const Email = createParamDecorator(
    (data: string, ctx: ExecutionContext): string | null => {
        const request = ctx.switchToHttp().getRequest();

        if (!request.email) {
            return null;
        }

        return request.email;
    },
);