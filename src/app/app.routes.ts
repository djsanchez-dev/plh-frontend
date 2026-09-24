import { Routes } from '@angular/router';
import { DashboardIndexComponent } from './pages/dashboard/index/index.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { authGuard } from './shared/services/auth.guard';
import { publicGuard } from './shared/services/public.guard';
import { roleGuard } from './shared/services/role.guard';
import { ServicesComponent } from './pages/services/services.component';
import { ScanComponent } from './pages/scan/scan.component';
import { ScanCaptureComponent } from './pages/scan/scan-capture.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { AdminUsersComponent } from './pages/admin/admin-users/admin-users.component';
import { AdminOwnersComponent } from './pages/admin/admin-owners/admin-owners.component';
import { AdminEmployeesComponent } from './pages/admin/admin-employees/admin-employees.component';
import { AdminDirectivesComponent } from './pages/admin/admin-directives/admin-directives.component';
import { AdminCondominiumsComponent } from './pages/admin/admin-condominiums/admin-condominiums.component';
import { AdminPointsComponent } from './pages/admin/admin-points/admin-points.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: DashboardIndexComponent,
        pathMatch: 'full',
        title: 'Dashboard principal | Playa Honda',
      },
      {
        path: 'dashboard',
        component: DashboardIndexComponent,
        title: 'Dashboard principal | Playa Honda',
      },
      {
        path: 'servicio',
        component: ServicesComponent,
        title: 'Servicios | Playa Honda',
      },
      {
        path: 'escanear',
        component: ScanComponent,
        canActivate: [roleGuard(['ADMIN', 'ASSISTANT_ADMIN', 'EMPLOYEE'])],
        title: 'Escanear | Playa Honda',
      },
      {
        path: 'm/:codigo',
        component: ScanCaptureComponent,
        canActivate: [roleGuard(['ADMIN', 'ASSISTANT_ADMIN', 'EMPLOYEE'])],
        title: 'Registrar lecturas | Playa Honda',
      },
      {
        path: 'inventario',
        component: InventoryComponent,
        title: 'Inventario | Playa Honda',
      },
      {
        path: 'admin/usuarios',
        component: AdminUsersComponent,
        canActivate: [roleGuard(['ADMIN', 'ASSISTANT_ADMIN', 'BOARD'])],
        title: 'Usuarios | Playa Honda',
      },
      {
        path: 'admin/propietarios',
        component: AdminOwnersComponent,
        canActivate: [roleGuard(['ADMIN', 'ASSISTANT_ADMIN', 'BOARD'])],
        title: 'Propietarios | Playa Honda',
      },
      {
        path: 'admin/empleados',
        component: AdminEmployeesComponent,
        canActivate: [roleGuard(['ADMIN', 'ASSISTANT_ADMIN', 'BOARD'])],
        title: 'Empleados | Playa Honda',
      },
      {
        path: 'admin/directiva',
        component: AdminDirectivesComponent,
        canActivate: [roleGuard(['ADMIN', 'ASSISTANT_ADMIN', 'BOARD'])],
        title: 'Directiva | Playa Honda',
      },
      {
        path: 'admin/condominios',
        component: AdminCondominiumsComponent,
        canActivate: [roleGuard(['ADMIN', 'ASSISTANT_ADMIN', 'BOARD'])],
        title: 'Condominios | Playa Honda',
      },
      {
        path: 'admin/puntos',
        component: AdminPointsComponent,
        canActivate: [roleGuard(['ADMIN', 'ASSISTANT_ADMIN', 'BOARD'])],
        title: 'Puntos del condominio | Playa Honda',
      },
      {
        path: 'perfil',
        component: ProfileComponent,
        title: 'Mi perfil | Playa Honda',
      },
    ],
  },
  {
    path: 'signin',
    component: SignInComponent,
    canActivate: [publicGuard],
    title: 'Iniciar sesión | Playa Honda',
  },
  {
    path: 'signup',
    component: SignUpComponent,
    canActivate: [publicGuard],
    title: 'Registro | Playa Honda',
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Página no encontrada | Playa Honda',
  },
];
