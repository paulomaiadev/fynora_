import { Injectable, NotFoundException } from '@nestjs/common';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getProfile(id: string, companyId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByIdAndCompany(id, companyId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return UserResponseDto.fromEntity(user);
  }

  async listTeam(companyId: string): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAllByCompany(companyId);

    return users.map((user) => UserResponseDto.fromEntity(user));
  }
}
