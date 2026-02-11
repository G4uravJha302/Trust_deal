import { OmitType, PartialType } from '@nestjs/mapped-types';
import { profileDTO } from './profile.dto';
import { IsDateString, IsOptional, IsPhoneNumber, IsString, MaxLength, ValidateNested } from 'class-validator';
// PartialType makes all fields from CreateProfileDto optional// dto/update-profile.dto.ts
// dto/update-profile.dto.ts
import { Type } from 'class-transformer';

class SocialLinksDto {
  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  github?: string;

  @IsOptional()
  @IsString()
  website?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;
}