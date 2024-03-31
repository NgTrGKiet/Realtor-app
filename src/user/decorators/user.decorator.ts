import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const User = createParamDecorator((data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    console.log(request.user)
    return request.user;
});