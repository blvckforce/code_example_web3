import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentAccount = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user || undefined;
  },
);

export type CurrentSessionAccount = {
  id: number,
  address: string,
  name: string,
  role: string,
  agentId: number,
  artistId: number,
};
