/**
 * Quanto Gastei? - Error Handler
 * Centralized error handling with user-friendly messages.
 */

export type AppErrorCode =
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN';

/**
 * Custom application error with structured metadata.
 */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly userMessage: string;
  readonly originalError: Error | null;

  constructor(
    code: AppErrorCode,
    userMessage: string,
    originalError?: Error,
  ) {
    super(userMessage);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    this.originalError = originalError ?? null;
  }
}

/**
 * Known Supabase/auth error message patterns mapped to Portuguese user messages.
 */
const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Email ou senha incorretos',
  'Email not confirmed': 'Confirme seu email antes de fazer login',
  'User already registered': 'Este email já está cadastrado',
  'Password should be at least': 'A senha deve ter no mínimo 6 caracteres',
  'Email rate limit exceeded': 'Muitas tentativas. Tente novamente mais tarde',
  'JWT expired': 'Sua sessão expirou. Faça login novamente',
  'refresh_token_not_found': 'Sua sessão expirou. Faça login novamente',
  'Network request failed': 'Sem conexão com a internet',
  'Failed to fetch': 'Sem conexão com a internet',
};

/**
 * Maps an error to a user-friendly AppError.
 */
export const handleError = (error: unknown): AppError => {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Standard Error
  if (error instanceof Error) {
    // Check for known patterns
    for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
      if (error.message.includes(pattern)) {
        const code = inferErrorCode(pattern);
        return new AppError(code, message, error);
      }
    }

    // Network errors
    if (isNetworkError(error)) {
      return new AppError(
        'NETWORK_ERROR',
        'Sem conexão com a internet. Verifique sua conexão e tente novamente.',
        error,
      );
    }

    // Auth errors
    if (isAuthError(error)) {
      return new AppError(
        'AUTH_ERROR',
        'Erro de autenticação. Faça login novamente.',
        error,
      );
    }

    // Unknown Error
    return new AppError(
      'UNKNOWN',
      'Ocorreu um erro inesperado. Tente novamente.',
      error,
    );
  }

  // Non-Error thrown value
  return new AppError(
    'UNKNOWN',
    'Ocorreu um erro inesperado. Tente novamente.',
  );
};

/**
 * Checks if an error is a network-related error.
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('enotfound')
    );
  }
  return false;
};

/**
 * Checks if an error is an authentication-related error.
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('jwt') ||
      message.includes('token') ||
      message.includes('unauthorized') ||
      message.includes('auth') ||
      message.includes('credentials') ||
      message.includes('session')
    );
  }
  return false;
};

/**
 * Infers an AppErrorCode from a known error pattern.
 */
const inferErrorCode = (pattern: string): AppErrorCode => {
  if (pattern.includes('Network') || pattern.includes('fetch')) {
    return 'NETWORK_ERROR';
  }
  if (
    pattern.includes('login') ||
    pattern.includes('JWT') ||
    pattern.includes('token') ||
    pattern.includes('session')
  ) {
    return 'AUTH_ERROR';
  }
  if (pattern.includes('Password') || pattern.includes('Email')) {
    return 'VALIDATION_ERROR';
  }
  if (pattern.includes('rate limit')) {
    return 'SERVER_ERROR';
  }
  return 'UNKNOWN';
};
