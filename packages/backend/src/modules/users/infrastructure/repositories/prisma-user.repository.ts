import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import {
  CreateUserInput,
  User,
} from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateUserInput): Promise<User> {
    const record = await this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        cpf: input.cpf,
        birthDate: input.birthDate,
        passwordHash: input.passwordHash,
      },
    });

    return this.toEntity(record);
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? this.toEntity(record) : null;
  }

  async findByCpf(cpf: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { cpf } });
    return record ? this.toEntity(record) : null;
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  private toEntity(record: {
    id: string;
    name: string;
    email: string;
    cpf: string;
    birthDate: Date;
    passwordHash: string;
    createdAt: Date;
  }): User {
    return new User(
      record.id,
      record.name,
      record.email,
      record.cpf,
      record.birthDate,
      record.passwordHash,
      record.createdAt,
    );
  }
}
