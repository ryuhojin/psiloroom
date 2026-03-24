import { Body, Controller, Inject, Post } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

import { CurrentSession } from "../../common/auth/current-session.decorator";
import { CalendarService } from "./calendar.service";
import { CreateCalendarEventDto } from "./dto/create-calendar-event.dto";

@Controller("calendar")
export class CalendarController {
  constructor(@Inject(CalendarService) private readonly calendarService: CalendarService) {}

  @Post("events")
  async createEvent(
    @CurrentSession() session: SessionTokenPayload,
    @Body() payload: CreateCalendarEventDto,
  ) {
    return this.calendarService.createEvent(session, payload);
  }
}
