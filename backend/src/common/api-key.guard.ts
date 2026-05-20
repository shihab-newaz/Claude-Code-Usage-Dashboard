import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { API_KEY } from "./env";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (!API_KEY) return true; // guard disabled when no key configured

    const req = context.switchToHttp().getRequest<Request>();
    const key = req.headers["x-api-key"];

    if (key !== API_KEY) {
      throw new UnauthorizedException("Invalid or missing API key");
    }
    return true;
  }
}
