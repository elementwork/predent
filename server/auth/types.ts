export type OAuthProvider =
  | "google"
  | "x"
  | "instagram"
  | "linkedin"
  | "apple"
  | "discord"
  | "microsoft"
  | "facebook";

export type OAuthProfile = {
  provider: OAuthProvider;
  unionId: string;
  email?: string;
  name?: string;
  avatar?: string;
};

export type OAuthState = {
  provider: OAuthProvider;
  codeVerifier: string;
  redirect: string;
};

export type SessionPayload = {
  unionId: string;
  provider: OAuthProvider;
  tokenVersion: number;
};
