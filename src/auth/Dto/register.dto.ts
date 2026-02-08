import { IsNotEmpty, 
  IsEmail, 
  MinLength, 
  IsString, 
  IsNumber, 
  Min,  
  Max} from 'class-validator';
import { Transform } from 'class-transformer';




export class UserRegisterDTO {
  @IsNotEmpty()
  @IsString()
  username !: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email !: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  password !: string;

  @IsNotEmpty()
  @IsString()
  gender !: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(18, { message: 'You must be at least 18 years old' })
  @Max(100, { message: 'Age must be less than or equal to 100' })
  Age !: number;

}
