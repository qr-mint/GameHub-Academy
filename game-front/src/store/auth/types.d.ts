type AuthState = {
  access_token: string | null;
  user: any | null;
};

type AuthActions = {
  authWeb: (data: any, key: string) => Promise<void>;
  auth: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;
