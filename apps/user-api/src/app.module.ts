import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

import { SessionTokenGuard } from "./common/auth/session-token.guard";
import { UserDataModule } from "./data/user-data.module";
import { AuthModule } from "./modules/auth/auth.module";
import { HealthModule } from "./modules/health/health.module";
import { InboxModule } from "./modules/inbox/inbox.module";
import { NoticesModule } from "./modules/notices/notices.module";
import { RealtimeModule } from "./modules/realtime/realtime.module";

@Module({
  imports: [UserDataModule, HealthModule, AuthModule, InboxModule, NoticesModule, RealtimeModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SessionTokenGuard,
    },
  ],
})
export class AppModule {}
