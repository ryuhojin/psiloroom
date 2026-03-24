import { IsOptional, IsString } from "class-validator";

export class ListNoticesDto {
  @IsOptional()
  @IsString()
  projectId?: string;
}
