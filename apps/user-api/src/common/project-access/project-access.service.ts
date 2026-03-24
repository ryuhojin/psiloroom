import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

import { USER_REPOSITORY, type UserRepository } from "../../data/user-repository";

@Injectable()
export class ProjectAccessService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async assertProjectMembership(session: SessionTokenPayload, projectId: string) {
    const isMember = await this.userRepository.isProjectMember(
      session.sub,
      session.tenantId,
      projectId,
    );

    if (!isMember) {
      throw new ForbiddenException("Project membership is required");
    }
  }

  async assertProjectPermission(
    session: SessionTokenPayload,
    projectId: string,
    permissionKey: string,
  ) {
    await this.assertProjectMembership(session, projectId);

    const allowed = await this.userRepository.hasProjectPermission(
      session.sub,
      session.tenantId,
      projectId,
      permissionKey,
    );

    if (!allowed) {
      throw new ForbiddenException(`Project permission ${permissionKey} is required`);
    }
  }
}
