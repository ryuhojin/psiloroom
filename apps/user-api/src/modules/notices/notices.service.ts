import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

import { ProjectAccessService } from "../../common/project-access/project-access.service";
import { USER_REPOSITORY, type UserRepository } from "../../data/user-repository";
import { CreateNoticeDto } from "./dto/create-notice.dto";
import { ListNoticesDto } from "./dto/list-notices.dto";

@Injectable()
export class NoticesService {
  constructor(
    @Inject(ProjectAccessService) private readonly projectAccessService: ProjectAccessService,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async findAll(session: SessionTokenPayload, query: ListNoticesDto) {
    if (query.projectId) {
      await this.projectAccessService.assertProjectMembership(session, query.projectId);
    }

    return this.userRepository.listNotices(
      session.sub,
      session.tenantId,
      session.projectIds,
      query.projectId,
    );
  }

  async create(session: SessionTokenPayload, payload: CreateNoticeDto) {
    await this.projectAccessService.assertProjectPermission(
      session,
      payload.projectId,
      "notice.manage",
    );

    const notice = await this.userRepository.createProjectNotice({
      tenantId: session.tenantId,
      projectId: payload.projectId,
      title: payload.title,
      body: payload.body,
      severity: payload.severity,
    });

    if (!notice) {
      throw new NotFoundException("Project notice scope was not found");
    }

    return notice;
  }
}
