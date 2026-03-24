import { IsIn, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateNoticeDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @MinLength(5)
  body!: string;

  @IsString()
  @IsIn(["info", "warning", "critical"])
  severity!: "info" | "warning" | "critical";
}
