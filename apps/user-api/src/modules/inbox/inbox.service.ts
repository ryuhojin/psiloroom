import { Inject, Injectable } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

import { USER_REPOSITORY, type UserRepository } from "../../data/user-repository";

@Injectable()
export class InboxService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  getSummary(session: SessionTokenPayload) {
    return this.userRepository.getInboxSummary(session.sub, session.tenantId, session.projectIds);
  }
}
