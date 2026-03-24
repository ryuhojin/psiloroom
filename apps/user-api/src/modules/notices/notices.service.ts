import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

import { USER_REPOSITORY, type UserRepository } from "../../data/user-repository";
import { ListNoticesDto } from "./dto/list-notices.dto";

@Injectable()
export class NoticesService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  findAll(session: SessionTokenPayload, query: ListNoticesDto) {
    if (query.projectId && !session.projectIds.includes(query.projectId)) {
      throw new ForbiddenException("Project membership is required");
    }

    return this.userRepository.listNotices(
      session.sub,
      session.tenantId,
      session.projectIds,
      query.projectId,
    );
  }
}
