export type ActionResponse<T = null> = {
  success: boolean;
  message?: string | null;
  error?: string | null;
  errors?: Record<string, string[] | undefined> | null;
  data?: T;
};

export interface ActionResult {
  success: boolean;
  message?: string;
}

export interface AuthActionResponse {
  success: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
}
