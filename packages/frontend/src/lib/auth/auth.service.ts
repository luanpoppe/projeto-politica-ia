import {
  loginRequest,
  logoutRequest,
  refreshRequest,
  registerRequest,
} from "./auth.api";
import type {
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
} from "./auth.types";
import {
  clearTokens,
  getRefreshToken,
  setTokens,
} from "./token-storage";

export async function register(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  return registerRequest(payload);
}

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  const tokens = await loginRequest(payload);
  setTokens(tokens.accessToken, tokens.refreshToken);
  return tokens;
}

export async function refreshTokens(): Promise<AuthTokens> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Refresh token ausente");
  }

  const tokens = await refreshRequest(refreshToken);
  setTokens(tokens.accessToken, tokens.refreshToken);
  return tokens;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await logoutRequest(refreshToken);
    } catch {
      // logout idempotente no backend
    }
  }
  clearTokens();
}
