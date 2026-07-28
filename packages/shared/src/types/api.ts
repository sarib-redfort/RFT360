/** Transport-level shapes returned by every API endpoint. */

/** Envelope returned by all paginated list endpoints. */
export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Error body produced by the global exception filter. Shape is stable across
 * every endpoint so the web app can render failures generically.
 */
export interface ApiErrorBody {
  statusCode: number;
  /** Machine-readable code, e.g. `VALIDATION_FAILED`, `UNAUTHORIZED`. */
  error: string;
  /** Human-readable summary safe to surface to the user. */
  message: string;
  /** Field-level validation errors, keyed by field path. */
  details?: Record<string, string[]>;
  path: string;
  timestamp: string;
  /** Correlates the response with a server log line. */
  requestId?: string;
}

/** Query parameters accepted by list endpoints. */
export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Tokens and profile returned by a successful login or refresh. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Access-token lifetime in seconds. */
  expiresIn: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

export interface LoginResponse extends AuthTokens {
  user: AuthenticatedUser;
}

/** Payload signed into the access token. */
export interface JwtPayload {
  /** User id. */
  sub: string;
  email: string;
  role: string;
  /** Token type discriminator — guards reject a refresh token used as access. */
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/** Body the API posts to the web app's revalidation route on publish. */
export interface RevalidatePayload {
  secret: string;
  tags: string[];
  /** Optional concrete paths to revalidate alongside the tags. */
  paths?: string[];
}
