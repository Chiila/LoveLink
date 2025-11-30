import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Multer configuration for file uploads
const multerConfig = {
  storage: diskStorage({
    destination: './uploads/profiles',
    filename: (req, file, callback) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  fileFilter: (req: any, file: any, callback: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return callback(new BadRequestException('Only image files are allowed'), false);
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user's profile
   * GET /users/profile
   */
  @Get('profile')
  async getProfile(@Request() req: any) {
    const profile = await this.usersService.getProfile(req.user.id);
    
    return {
      success: true,
      data: { profile },
    };
  }

  /**
   * Update current user's profile
   * PUT /users/profile
   */
  @Put('profile')
  async updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const profile = await this.usersService.updateProfile(req.user.id, updateProfileDto);
    
    return {
      success: true,
      message: 'Profile updated successfully',
      data: { profile },
    };
  }

  /**
   * Upload profile photo
   * POST /users/upload-photo
   */
  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('photo', multerConfig))
  async uploadPhoto(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Please upload a photo');
    }

    const photoPath = `/uploads/profiles/${file.filename}`;
    const profile = await this.usersService.updateProfilePhoto(req.user.id, photoPath);

    return {
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photoUrl: photoPath,
        profile,
      },
    };
  }

  /**
   * Get another user's profile by ID
   * GET /users/:id
   */
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    const profile = await this.usersService.getProfileById(id);
    
    return {
      success: true,
      data: { profile },
    };
  }
}

