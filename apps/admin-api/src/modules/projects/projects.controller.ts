import { Controller, Get, Query } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

import { CurrentSession } from "../../common/auth/current-session.decorator";
import { ListProjectsDto } from "./dto/list-projects.dto";
import { ProjectsService } from "./projects.service";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async getProjects(
    @CurrentSession() session: SessionTokenPayload,
    @Query() query: ListProjectsDto,
  ) {
    return this.projectsService.findAll(session, query);
  }
}
