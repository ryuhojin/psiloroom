import { Controller, Get, Inject } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

import { CurrentSession } from "../../common/auth/current-session.decorator";
import { TenantsService } from "./tenants.service";

@Controller("tenants")
export class TenantsController {
  constructor(@Inject(TenantsService) private readonly tenantsService: TenantsService) {}

  @Get()
  async getTenants(@CurrentSession() session: SessionTokenPayload) {
    return this.tenantsService.findAll(session);
  }
}
