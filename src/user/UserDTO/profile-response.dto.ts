// dto/profile-response.dto.ts
import { Expose, Type } from 'class-transformer';

export class ProfileResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  @Type(() => ProfileDetailsDto)
  profile: ProfileDetailsDto;

  @Expose()
  createdAt: Date;
}

class ProfileDetailsDto {
  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  bio: string;

  @Expose()
  avatar: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  dateOfBirth: Date;

  @Expose()
  city: string;

  @Expose()
  country: string;

  @Expose()
  socialLinks: any;
}