import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

import { TokenService } from "src/service/token.service";



@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService
  ) {}
  async canActivate(context: ExecutionContext) {
    console.log("🚀 ~ AuthGuard:")
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const user = this.extractUserFromHeader(request);
    let pass = false;
    if (!token) {
      throw new UnauthorizedException();
    }
    const payload = await this.tokenService.verifyToken(token);
    if (user && payload && +user === +(payload as any).userId) {
      pass = true
    }else {
      throw new UnauthorizedException();
    }
    return pass;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    if (!(request.headers as any).authorization) {
      return undefined;
    }
    const [type, token] = (request.headers as any).authorization.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractUserFromHeader(request: Request): string | undefined {
    const user = (request.headers as any).user;
    return user;
  }
}