import { IsOptional, IsString } from "class-validator";

export class ListProjectsDto {
  @IsOptional()
  @IsString()
  tenantId?: string;
}
