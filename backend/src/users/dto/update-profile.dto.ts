import {
  IsString,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Gender } from '../../entities/profile.entity';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(18, { message: 'You must be at least 18 years old' })
  @Max(120, { message: 'Please provide a valid age' })
  age?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
  bio?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'Please select a valid gender' })
  gender?: Gender;

  @IsOptional()
  @IsEnum(Gender, { message: 'Please select a valid preference' })
  interestedIn?: Gender;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  maxDistance?: number;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(120)
  minAgePreference?: number;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(120)
  maxAgePreference?: number;
}

