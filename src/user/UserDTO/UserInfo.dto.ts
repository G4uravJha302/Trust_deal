import { IsNotEmpty, IsString } from 'class-validator';

export class UserInfo {
  @IsString()
  @IsNotEmpty()
  id: string;
}