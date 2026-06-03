import axios from "axios";
import { getApiUrl } from "../api/get-api-url";
import type {
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
} from "./auth.types";
import { getAccessToken } from "./token-storage";

const rawClient = axios.create({
  baseURL: getApiUrl(),
  headers: { "Content-Type": "application/json" },
});

export async function registerRequest(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const { data } = await rawClient.post<RegisterResponse>(
    "/auth/register",
    payload,
  );
  return data;
}

export async function loginRequest(payload: LoginPayload): Promise<AuthTokens> {
  const { data } = await rawClient.post<AuthTokens>("/auth/login", payload);
  return data;
}

export async function refreshRequest(
  refreshToken: string,
): Promise<AuthTokens> {
  const { data } = await rawClient.post<AuthTokens>("/auth/refresh", {
    refreshToken,
  });
  return data;
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  const accessToken = getAccessToken();
  await rawClient.post(
    "/auth/logout",
    { refreshToken },
    accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  );
}
