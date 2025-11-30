import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Profile, Gender } from '../entities/profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new user with profile
   */
  async register(registerDto: RegisterDto): Promise<{ user: User; token: string }> {
    const { email, password, name, age, bio, gender, interestedIn } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Validate age
    if (age < 18) {
      throw new BadRequestException('You must be at least 18 years old');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = this.usersRepository.create({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await this.usersRepository.save(user);

    // Create profile
    const profile = this.profilesRepository.create({
      userId: user.id,
      name,
      age,
      bio: bio || '',
      gender: gender || Gender.OTHER,
      interestedIn: interestedIn || null,
    });

    await this.profilesRepository.save(profile);

    // Generate JWT token
    const token = this.generateToken(user);

    // Load user with profile
    const userWithProfile = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: ['profile'],
    });

    return { user: userWithProfile!, token };
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['profile'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last active
    user.lastActive = new Date();
    await this.usersRepository.save(user);

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Validate user from JWT payload
   */
  async validateUser(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['profile'],
    });
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}

