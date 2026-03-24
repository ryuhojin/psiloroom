import { Global, Module } from "@nestjs/common";

import { InMemoryUserRepository } from "./in-memory-user.repository";
import { PrismaUserRepository } from "./prisma-user.repository";
import { USER_REPOSITORY } from "./user-repository";

@Global()
@Module({
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass:
        process.env.NODE_ENV === "test" ? InMemoryUserRepository : PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserDataModule {}
