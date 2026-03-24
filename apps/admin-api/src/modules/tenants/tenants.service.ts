import { Inject, Injectable } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

import { ADMIN_REPOSITORY, type AdminRepository } from "../../data/admin-repository";

@Injectable()
export class TenantsService {
  constructor(
    @Inject(ADMIN_REPOSITORY) private readonly adminRepository: AdminRepository,
  ) {}

  async findAll(session: SessionTokenPayload) {
    return this.adminRepository.listTenantsForTenant(
      session.tenantId,
      session.roles.includes("super_admin"),
    );
  }
}
