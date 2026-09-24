export interface AuthResponse {
  /** `null` cuando la cuenta está pendiente de aprobación (sin sesión todavía). */
  accessToken: string | null;
  tokenType: string;
  expiresIn: number;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  employeeType?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  phone?: string | null;
  address?: string | null;
  /** Miembro de la directiva (propietario marcado). */
  boardMember?: boolean;
  /** Cargo en la directiva: PRESIDENT, VICEPRESIDENT, SECRETARY, TREASURER, VOCAL. */
  boardPosition?: string | null;
  /** Propiedad (número de lote) cuando el rol es OWNER. */
  property?: string | null;
  enabled?: boolean;
}

export interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
