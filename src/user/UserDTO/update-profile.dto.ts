import { OmitType, PartialType } from '@nestjs/mapped-types';
import { profileDTO } from './profile.dto';

// PartialType makes all fields from CreateProfileDto optional
export class UpdateProfileDto extends PartialType(profileDTO) {}