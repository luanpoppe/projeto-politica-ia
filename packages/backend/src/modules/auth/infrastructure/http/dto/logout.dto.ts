import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export class LogoutDto extends createZodDto(logoutSchema) {}
