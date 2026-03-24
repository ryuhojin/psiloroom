import { Global, Module } from "@nestjs/common";

import { ADMIN_REPOSITORY } from "./admin-repository";
import { InMemoryAdminRepository } from "./in-memory-admin.repository";
import { PrismaAdminRepository } from "./prisma-admin.repository";

@Global()
@Module({
  providers: [
    {
      provide: ADMIN_REPOSITORY,
      useClass:
        process.env.NODE_ENV === "test" ? InMemoryAdminRepository : PrismaAdminRepository,
    },
  ],
  exports: [ADMIN_REPOSITORY],
})
export class AdminDataModule {}
