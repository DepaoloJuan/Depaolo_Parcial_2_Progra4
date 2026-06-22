# Red Social — TP2 Programación IV

**Alumno:** Juan Manuel Depaolo  
**Materia:** Programación IV — UTN Avellaneda  
**Año:** 2026  

**🔗 Deploy Frontend:** https://depaolo-parcial-2-progra4.vercel.app  
**🔗 Deploy Backend:** https://tp2-redsocial-backend.onrender.com/api/v1  

---

## Tecnologías utilizadas

**Frontend**
- Angular 21 (Standalone Components, Signals API, Lazy Loading)
- TypeScript 5.6+
- Bootstrap 5 (CDN)
- Chart.js
- Angular PWA

**Backend**
- NestJS
- MongoDB Atlas + Mongoose
- Cloudinary (almacenamiento de imágenes)
- JWT (autenticación)
- Bcryptjs (encriptación de contraseñas)
- Swagger (documentación de API)

**Deploy**
- Frontend: Vercel
- Backend: Render

---

## Sprints

### Sprint 1 — Base del proyecto
Configuración inicial del proyecto Angular y NestJS. Implementación de las pantallas de **Registro** y **Login** con validaciones de formulario. Módulo de **Autenticación** en el backend con encriptación de contraseña y subida de imagen de perfil a Cloudinary. Pantallas de **Publicaciones** y **Mi Perfil** como estructura base. Deploy inicial en Vercel y Render.

### Sprint 2 — Publicaciones y perfil
Implementación completa del módulo de **Publicaciones**: listado ordenado por fecha o cantidad de me gusta, paginación, creación con imagen, baja lógica y sistema de me gusta. Cada publicación es un componente reutilizable. **Mi Perfil** muestra los datos del usuario, sus últimas 3 publicaciones con comentarios, y permite editar el perfil.

### Sprint 3 — Autenticación JWT y comentarios
Integración de **JWT** para autenticación segura con tokens de 15 minutos y refresh token. Interceptor HTTP que agrega el Bearer token en cada request y redirige al login ante un 401. Spinner de carga al iniciar la app con validación del token. Modal de sesión por vencer con opción de extender. Módulo de **Comentarios** con paginación, edición inline y marca de editado.

### Sprint 4 — Dashboard de administración y PWA
Panel de **administración** con gestión de usuarios (listar, crear, habilitar/deshabilitar) y **estadísticas** con gráficos de barras, líneas y torta usando Chart.js. Guards de roles para proteger las rutas de admin. Conversión a **PWA** con `@angular/pwa`. Implementación de 3 pipes propias (`fechaRelativa`, `primeraMayuscula`, `truncar`) y 3 directivas propias (`appResaltar`, `appAutoFocus`, `appClickFuera`).

---

## Estructura del proyecto

\`\`\`
├── Backend/          # NestJS API
│   └── src/
│       ├── autenticacion/
│       ├── usuarios/
│       ├── publicaciones/
│       ├── comentarios/
│       └── cloudinary/
└── Frontend/         # Angular 21
    └── src/
        ├── app/
        │   ├── components/
        │   ├── pages/
        │   ├── services/
        │   ├── guards/
        │   ├── interceptors/
        │   ├── pipes/
        │   └── directives/
        └── environments/
\`\`\`
