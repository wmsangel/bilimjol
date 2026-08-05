import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

interface AuthedRequest {
  headers: Record<string, string | string[] | undefined>;
  userId?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers["authorization"];
    if (Array.isArray(header)) throw new UnauthorizedException();
    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(
        header.slice(7),
        { secret: process.env.JWT_ACCESS_SECRET ?? "dev-access" },
      );
      req.userId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
