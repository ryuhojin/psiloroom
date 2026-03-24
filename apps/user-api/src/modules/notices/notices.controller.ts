import { Controller, Get, Query } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

import { CurrentSession } from "../../common/auth/current-session.decorator";
import { ListNoticesDto } from "./dto/list-notices.dto";
import { NoticesService } from "./notices.service";

@Controller("notices")
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get()
  async getNotices(
    @CurrentSession() session: SessionTokenPayload,
    @Query() query: ListNoticesDto,
  ) {
    return this.noticesService.findAll(session, query);
  }
}
