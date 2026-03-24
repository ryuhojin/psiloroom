import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Public } from "../../common/auth/public.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  async login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }
}
