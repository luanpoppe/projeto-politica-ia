export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly cpf: string,
    public readonly birthDate: Date,
    public readonly passwordHash: string,
    public readonly createdAt: Date,
  ) {}
}

export type CreateUserInput = {
  name: string;
  email: string;
  cpf: string;
  birthDate: Date;
  passwordHash: string;
};

export type UserPublicProfile = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  createdAt: Date;
};

export function toUserPublicProfile(user: User): UserPublicProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    cpf: user.cpf,
    birthDate: user.birthDate.toISOString().slice(0, 10),
    createdAt: user.createdAt,
  };
}
