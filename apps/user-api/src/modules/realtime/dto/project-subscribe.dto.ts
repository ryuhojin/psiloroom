import { IsNotEmpty, IsString } from "class-validator";

export class ProjectSubscribeDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;
}
