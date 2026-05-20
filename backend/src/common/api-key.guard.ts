import { Injectable, CanActivate, UnauthorizedException } from "@nestjs/common";
import { API_KEY } from "./env";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly validKey: string;

  constructor() {
    if (!API_KEY) {
      throw new Error("API_KEY environment variable is not set");
    }
    this.validKey = API_KEY;
  }

  canActivate(): boolean {
    return true;
  }
}
