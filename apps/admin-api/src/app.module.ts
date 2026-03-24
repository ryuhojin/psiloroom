import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

import { SessionTokenGuard } from "./common/auth/session-token.guard";
import { AdminDataModule } from "./data/admin-data.module";
import { AuthModule } from "./modules/auth/auth.module";
import { HealthModule } from "./modules/health/health.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { TenantsModule } from "./modules/tenants/tenants.module";

@Module({
  imports: [AdminDataModule, HealthModule, AuthModule, TenantsModule, ProjectsModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SessionTokenGuard,
    },
  ],
})
export class AppModule {}
