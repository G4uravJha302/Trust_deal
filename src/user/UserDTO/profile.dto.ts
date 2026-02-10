import { IsString, isString } from "class-validator";

export class profileDTO {
  @IsString()
  username: string;
  
  @IsString()
  fullname: string;

  @IsString()
  email: string;
  
  @IsString()
  bio: string;
  
  Age: number;
  
  @IsString()
  address: string;
  //@IsString()
  //avatarUrl: string;
}