# AGENTS.md — PLH Frontend (Angular 22 + Tailwind v4)

> Panel administrativo del condominio Playa Honda. Standalone components, Tailwind CSS v4,
> ApexCharts (gráficos), enrutamiento estático y JWT contra `plh-backend`.

## Mapa del repositorio

```
src/
├── main.ts                      # bootstrap + appConfig
├── index.html
├── styles.css                   # tema Tailwind v4 (@theme, utilidades, estilos apexcharts)
└── app/
    ├── app.component.*          # raíz: refresco de sesión JWT
    ├── app.config.ts            # providers: router, http con interceptor JWT, animations
    ├── app.routes.ts            # rutas estáticas (sin lazy loading)
    ├── pages/
    │   ├── auth-pages/          # sign-in, sign-up
    │   ├── dashboard/index/     # dashboard principal (widget del reservorio + resumen real)
    │   ├── services/            # consumo diario de servicios (agua/luz) por propietario
    │   ├── scan/                # escáner QR por propiedad (/escanear) y captura de
    │   │                        # lecturas de medidor (/m/:codigo)
    │   ├── inventory/           # items y movimientos de inventario
    │   ├── admin/               # usuarios, propietarios, empleados, directiva,
    │   │                        # condominios, puntos (CRUD)
    │   ├── profile/             # /perfil: datos personales + cambio de contraseña
    │   └── other-page/          # 404
    └── shared/
        ├── components/
        │   ├── auth/            # formularios signin/signup
        │   ├── common/          # grid-shape, theme-toggle
        │   ├── ecommerce/       # monthly-target (panel del reservorio)
        │   ├── form/input/      # input-field, checkbox, label
        │   ├── header/          # notification-dropdown, user-dropdown
        │   └── ui/              # button, dropdown
        ├── layout/              # app-layout, app-sidebar, app-header, auth-page-layout, backdrop
        ├── models/              # interfaces (admin, inventory, reservoir, services)
        ├── pipe/                # safe-html
        └── services/            # auth, guards, interceptor y APIs REST
```

## Convenciones

- Componentes standalone; las importaciones de plantilla viven en el arreglo `imports` del decorador.
- Rutas nuevas: registrar en `app.routes.ts` dentro de `AppLayoutComponent` y proteger con
  `authGuard` (+ `roleGuard(['ADMIN', ...])` en rutas de administración).
- La URL del backend se centraliza en `src/environments/environment.ts` (`apiUrl`);
  **no** hardcodear `http://localhost:8080` en servicios.
- Feedback de formularios: errores por campo del backend (`error.error.errors`) +
  `ToastService` (`shared/services/toast.service.ts`) para éxitos.
- Todo dato viene del backend (`HttpClient` + `auth.interceptor.ts`); **no** se añaden datos
  de prueba o fallbacks hardcodeados. La única excepción es la lectura del reservorio
  (API externa mockapi, widget intacto).
- No reintroducir dependencias de la plantilla (FullCalendar, Flatpickr, Swiper, amCharts,
  prismjs, karma) sin un uso real: fueron eliminadas en la limpieza.
- Verificar con `npm run build` antes de dar por terminado un cambio.

## Base de datos

El backend nunca debe borrar datos: `spring.jpa.hibernate.ddl-auto=update` y
`spring.sql.init.mode=never` (ver `../README-DB.md`). No existe
`schema-postgresql.sql`: el esquema lo crea Hibernate; migraciones manuales en
`../plh-backend/migrations/`.

## Endpoints clave

- `GET /api/dashboard/summary` → resumen real (usuarios, empleados, inventario,
  consumo, condominios, movimientos recientes).
- `GET /api/admin/people/pending` → cuentas pendientes de aprobación (campana).
- `PUT /api/auth/me`, `PUT /api/auth/me/password` → perfil y contraseña propios.
- `GET /api/inventory/movements/active-loans` → préstamos activos (evita N+1).
- `GET /api/services/scan/{qrCode}` y `POST /api/services/scan/{qrCode}/consumption`
  → ficha y registro de lecturas de medidor por QR.
- `GET /api/services/today` → avance del recorrido diario (pendientes de hoy).
- `GET /api/properties` → propiedades con su QR (impresión de etiquetas).
