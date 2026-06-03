export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  password: string;
};

export type RegisterResponse = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  createdAt: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};
