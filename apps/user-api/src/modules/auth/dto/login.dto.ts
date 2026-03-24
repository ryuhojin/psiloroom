import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  tenantCode!: string;

  @IsString()
  @IsNotEmpty()
  loginId!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
