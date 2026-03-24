import { Module } from "@nestjs/common";

import { ProjectAccessService } from "../../common/project-access/project-access.service";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

@Module({
  controllers: [ChatController],
  providers: [ProjectAccessService, ChatService],
})
export class ChatModule {}
