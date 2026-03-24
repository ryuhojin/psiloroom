import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

import { ProjectAccessService } from "../../common/project-access/project-access.service";
import { USER_REPOSITORY, type UserRepository } from "../../data/user-repository";
import { CreateChatMessageDto } from "./dto/create-chat-message.dto";

@Injectable()
export class ChatService {
  constructor(
    @Inject(ProjectAccessService) private readonly projectAccessService: ProjectAccessService,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async createMessage(session: SessionTokenPayload, payload: CreateChatMessageDto) {
    await this.projectAccessService.assertProjectPermission(
      session,
      payload.projectId,
      "chat.message.write",
    );

    const message = await this.userRepository.createProjectChatMessage({
      accountId: session.sub,
      tenantId: session.tenantId,
      projectId: payload.projectId,
      body: payload.body,
    });

    if (!message) {
      throw new NotFoundException("Project chat room was not found");
    }

    return message;
  }
}
