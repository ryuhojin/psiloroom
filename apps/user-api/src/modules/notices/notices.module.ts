import { Module } from "@nestjs/common";

import { ProjectAccessService } from "../../common/project-access/project-access.service";
import { NoticesController } from "./notices.controller";
import { NoticesService } from "./notices.service";

@Module({
  controllers: [NoticesController],
  providers: [ProjectAccessService, NoticesService],
})
export class NoticesModule {}
