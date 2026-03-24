import { Controller, Get } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

import { CurrentSession } from "../../common/auth/current-session.decorator";
import { InboxService } from "./inbox.service";

@Controller("inbox")
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Get("summary")
  async getSummary(@CurrentSession() session: SessionTokenPayload) {
    return this.inboxService.getSummary(session);
  }
}
