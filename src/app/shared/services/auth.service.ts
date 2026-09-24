import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  ProfileUpdateRequest,
  RegisterRequest,
  UserResponse,
} from './auth.models';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/api/auth`;
const TOKEN_KEY = 'plh_access_token';
const SESSION_TOKEN_KEY = 'plh_session_access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserState = signal<UserResponse | null>(null);

  readonly currentUser = this.currentUserState.asReadonly();

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest, rememberMe: boolean): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/login`, request).pipe(
      tap((response) => {
        if (response.accessToken) {
          this.storeToken(response.accessToken, rememberMe);
        }
      }),
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/register`, request).pipe(
      tap((response) => {
        // Sin token = cuenta pendiente de aprobación: no hay sesión que guardar.
        if (response.accessToken) {
          this.storeToken(response.accessToken, true);
        }
      }),
    );
  }

  me(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${API_URL}/me`).pipe(
      tap((user) => this.currentUserState.set(user)),
    );
  }

  updateProfile(request: ProfileUpdateRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${API_URL}/me`, request).pipe(
      tap((user) => this.currentUserState.set(user)),
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${API_URL}/me/password`, request);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(SESSION_TOKEN_KEY) ?? null;
  }

  /**
   * Roles efectivos del usuario actual: su rol base más BOARD si es miembro de la
   * directiva (la directiva está conformada por propietarios, no cambian de rol).
   */
  effectiveRoles(): string[] {
    const user = this.currentUserState();
    if (!user) {
      return [];
    }
    const roles = [user.role];
    if (user.boardMember && user.role !== 'BOARD') {
      roles.push('BOARD');
    }
    return roles;
  }

  hasAnyRole(roles: string[]): boolean {
    const effective = this.effectiveRoles();
    return roles.some((role) => effective.includes(role));
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    this.currentUserState.set(null);
  }

  private storeToken(token: string, rememberMe: boolean): void {
    this.logout();
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    }
  }
}
