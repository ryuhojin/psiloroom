import { Body, Controller, Get, Inject, Post, Query } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

import { CurrentSession } from "../../common/auth/current-session.decorator";
import { CreateNoticeDto } from "./dto/create-notice.dto";
import { ListNoticesDto } from "./dto/list-notices.dto";
import { NoticesService } from "./notices.service";

@Controller("notices")
export class NoticesController {
  constructor(@Inject(NoticesService) private readonly noticesService: NoticesService) {}

  @Get()
  async getNotices(
    @CurrentSession() session: SessionTokenPayload,
    @Query() query: ListNoticesDto,
  ) {
    return this.noticesService.findAll(session, query);
  }

  @Post()
  async createNotice(
    @CurrentSession() session: SessionTokenPayload,
    @Body() payload: CreateNoticeDto,
  ) {
    return this.noticesService.create(session, payload);
  }
}
