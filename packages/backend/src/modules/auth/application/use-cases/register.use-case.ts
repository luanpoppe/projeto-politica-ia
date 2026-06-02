import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { isValidCpf, normalizeCpf } from '../../../../shared/utils/cpf.util';
import {
  toUserPublicProfile,
  UserPublicProfile,
} from '../../../users/domain/entities/user.entity';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../users/domain/repositories/user.repository.interface';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '../../domain/services/password-hasher.interface';

export type RegisterInput = {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  password: string;
};

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: RegisterInput): Promise<UserPublicProfile> {
    const cpf = normalizeCpf(input.cpf);

    if (!isValidCpf(cpf)) {
      throw new BadRequestException('CPF inválido');
    }

    const birthDate = new Date(`${input.birthDate}T00:00:00.000Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (Number.isNaN(birthDate.getTime()) || birthDate >= today) {
      throw new BadRequestException('Data de nascimento inválida');
    }

    const [existingEmail, existingCpf] = await Promise.all([
      this.userRepository.findByEmail(input.email),
      this.userRepository.findByCpf(cpf),
    ]);

    if (existingEmail) {
      throw new ConflictException('E-mail já cadastrado');
    }

    if (existingCpf) {
      throw new ConflictException('CPF já cadastrado');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      cpf,
      birthDate,
      passwordHash,
    });

    return toUserPublicProfile(user);
  }
}
