export type AdminPersonRole = 'ADMIN' | 'ASSISTANT_ADMIN' | 'EMPLOYEE' | 'OWNER' | 'BOARD' | 'RESIDENT';
export type AdminEmployeeType = 'CLEANING' | 'MAINTENANCE' | 'GARDENING' | 'CCTV_OPERATOR' | 'SECURITY_GUARD' | 'ASSISTANT_ADMIN';

/** Cargos dentro de la directiva del condominio. */
export type BoardPosition = 'PRESIDENT' | 'VICEPRESIDENT' | 'SECRETARY' | 'TREASURER' | 'VOCAL';

export const BOARD_POSITIONS: BoardPosition[] = ['PRESIDENT', 'VICEPRESIDENT', 'SECRETARY', 'TREASURER', 'VOCAL'];

export const BOARD_POSITION_LABELS: Record<BoardPosition, string> = {
  PRESIDENT: 'Presidente',
  VICEPRESIDENT: 'Vicepresidente',
  SECRETARY: 'Secretario',
  TREASURER: 'Tesorero',
  VOCAL: 'Vocal',
};

export interface AdminPerson {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: AdminPersonRole;
  employeeType?: AdminEmployeeType | null;
  documentType?: string | null;
  documentNumber?: string | null;
  phone?: string | null;
  address?: string | null;
  /** Miembro de la directiva (solo aplica a propietarios). */
  boardMember?: boolean;
  boardPosition?: BoardPosition | null;
  /** Propiedad (número de lote). */
  property?: string | null;
}

/** Propiedad física con su QR (para impresión de etiquetas). */
export interface PropertyPrint {
  id: string;
  qrCode: string;
  lot: string;
  ownerName: string;
}

export interface AdminPersonForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: AdminPersonRole;
  employeeType: AdminEmployeeType | null;
  documentType: string;
  documentNumber: string;
  phone: string;
  address: string;
  boardMember: boolean;
  boardPosition: BoardPosition | null;
  property: string;
}
