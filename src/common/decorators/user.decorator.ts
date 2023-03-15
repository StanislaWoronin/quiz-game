import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator(
  (data: string, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.user) {
      return null;
    }

    return request.userId;
  },
);
