import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

import { CurrentSession } from "../../common/auth/current-session.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshSessionDto } from "./dto/refresh-session.dto";
import { Public } from "../../common/auth/public.decorator";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  async login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @Public()
  @Post("refresh")
  async refresh(@Body() payload: RefreshSessionDto) {
    return this.authService.refresh(payload.refreshToken);
  }

  @Get("session")
  async getSession(@CurrentSession() session: SessionTokenPayload) {
    return this.authService.getSession(session);
  }
}
