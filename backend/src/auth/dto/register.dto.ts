import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Gender } from '../../entities/profile.entity';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @IsInt()
  @Min(18, { message: 'You must be at least 18 years old' })
  @Max(120, { message: 'Please provide a valid age' })
  age: number;

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
}

