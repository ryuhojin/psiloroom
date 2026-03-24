import { Body, Controller, Inject, Post } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

import { CurrentSession } from "../../common/auth/current-session.decorator";
import { CreateChatMessageDto } from "./dto/create-chat-message.dto";
import { ChatService } from "./chat.service";

@Controller("chat")
export class ChatController {
  constructor(@Inject(ChatService) private readonly chatService: ChatService) {}

  @Post("messages")
  async createMessage(
    @CurrentSession() session: SessionTokenPayload,
    @Body() payload: CreateChatMessageDto,
  ) {
    return this.chatService.createMessage(session, payload);
  }
}
