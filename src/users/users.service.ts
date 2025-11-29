import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];

  create(createUserDto: CreateUserDto): User {
    const user: User = {
      id: (this.users.length + 1).toString(),
      status: createUserDto.status || '활성',
      description: createUserDto.description || '',
      ...createUserDto,
    };

    this.users.push(user);
    return user;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  findByUserId(userId: string): User {
    return this.users.find((user) => user.userId === userId);
  }

  update(id: string, updateUserDto: UpdateUserDto): User {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.users[index] = { ...this.users[index], ...updateUserDto };
    return this.users[index];
  }

  remove(id: string): void {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const index = this.users.findIndex((user) => user.id === id);
    this.users.splice(index, 1);
  }
}

