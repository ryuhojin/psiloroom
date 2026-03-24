import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

import { ADMIN_REPOSITORY, type AdminRepository } from "../../data/admin-repository";
import { ListProjectsDto } from "./dto/list-projects.dto";

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(ADMIN_REPOSITORY) private readonly adminRepository: AdminRepository,
  ) {}

  async findAll(session: SessionTokenPayload, query: ListProjectsDto) {
    const requestedTenantId = query.tenantId ?? session.tenantId;

    if (!session.roles.includes("super_admin") && requestedTenantId !== session.tenantId) {
      throw new ForbiddenException("Cross-tenant access is not allowed");
    }

    return this.adminRepository.listProjectsByTenant(requestedTenantId);
  }
}
