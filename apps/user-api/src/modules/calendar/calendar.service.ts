import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

import { ProjectAccessService } from "../../common/project-access/project-access.service";
import { USER_REPOSITORY, type UserRepository } from "../../data/user-repository";
import { CreateCalendarEventDto } from "./dto/create-calendar-event.dto";

@Injectable()
export class CalendarService {
  constructor(
    @Inject(ProjectAccessService) private readonly projectAccessService: ProjectAccessService,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async createEvent(session: SessionTokenPayload, payload: CreateCalendarEventDto) {
    const startsAt = new Date(payload.startsAt);
    const endsAt = new Date(payload.endsAt);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || startsAt >= endsAt) {
      throw new BadRequestException("Invalid calendar event schedule");
    }

    await this.projectAccessService.assertProjectPermission(
      session,
      payload.projectId,
      "calendar.manage",
    );

    const event = await this.userRepository.createProjectCalendarEvent({
      tenantId: session.tenantId,
      projectId: payload.projectId,
      title: payload.title,
      description: payload.description,
      startsAt,
      endsAt,
    });

    if (!event) {
      throw new NotFoundException("Project calendar was not found");
    }

    return event;
  }
}
