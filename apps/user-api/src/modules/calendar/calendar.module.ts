import { Module } from "@nestjs/common";

import { ProjectAccessService } from "../../common/project-access/project-access.service";
import { CalendarController } from "./calendar.controller";
import { CalendarService } from "./calendar.service";

@Module({
  controllers: [CalendarController],
  providers: [ProjectAccessService, CalendarService],
})
export class CalendarModule {}
