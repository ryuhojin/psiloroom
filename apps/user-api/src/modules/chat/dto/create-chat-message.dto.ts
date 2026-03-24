import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateChatMessageDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsString()
  @MinLength(2)
  body!: string;
}
