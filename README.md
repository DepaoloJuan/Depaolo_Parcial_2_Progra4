# Red Social — TP2 Programación IV

**Alumno:** Depaolo, Juan Manuel

Aplicación de red social desarrollada para la materia Programación IV (UTN FR Avellaneda). Proyecto dividido en frontend (Angular 21) y backend (NestJS + MongoDB), construido de forma incremental en 4 sprints.

## Deploy

- **Frontend:** https://depaolo-parcial-2-progra4.vercel.app/
- **Backend:** https://tp2-redsocial-backend.onrender.com

## Stack

- **Frontend:** Angular 21 (Standalone Components, Signals), Bootstrap 5, Vercel
- **Backend:** NestJS, Render, Node 20.x
- **Base de datos:** MongoDB Atlas + Mongoose
- **Imágenes:** Cloudinary
- **Autenticación:** JWT (15 minutos de vencimiento)

## Repositorio

Cada sprint se desarrolló en su propia rama, mergeada de forma incremental: `sprint-1` → `sprint-2` → `sprint-3` → `sprint-4`.

---

## Sprint 1 — Fundamentos y autenticación

**Frontend:**
- Creación del proyecto Angular con deploy en Vercel.
- Pantallas: Registro, Login, Publicaciones, Mi Perfil.
- Navegación entre componentes y favicon propio.
- Login con validaciones (correo o nombre de usuario único, contraseña con mayúscula, número y mínimo 8 caracteres).
- Registro con todos los datos del usuario, imagen de perfil y atributo `perfil` (usuario/administrador).

**Backend:**
- Creación del proyecto NestJS.
- Módulos: Usuarios, Autenticación, Publicaciones.
- Registro: valida datos, encripta contraseña, guarda imagen de perfil en Cloudinary.
- Login: valida credenciales y devuelve los datos del usuario.

---

## Sprint 2 — Publicaciones, likes y perfil

**Frontend:**
- Página Publicaciones: listado ordenado por fecha, opción de ordenar por likes, paginación, componente por publicación, dar/quitar like, eliminar publicaciones propias.
- Mi Perfil: datos del usuario, foto de perfil, últimas 3 publicaciones con sus comentarios.

**Backend:**
- Módulo Publicaciones: alta, baja lógica (autor o admin), listado con filtros (offset, limit, orden por fecha o likes, filtro por usuario).
- Likes: alta y baja, un usuario solo puede dar un like por publicación.

---

## Sprint 3 — Comentarios, sesión y seguridad

**Frontend:**
- Página de detalle de publicación: comentarios paginados con "cargar más", edición de comentarios propios (marcados como *modificado*).
- Pantalla de carga inicial con spinner que valida el token contra el backend.
- Contador de sesión: aviso a los 5 minutos de vencer el token (15 min), con opción de refrescarlo. Redirección automática al login ante un 401.

**Backend:**
- Módulo Comentarios: crear, listar (paginado, más recientes primero), editar mensaje con flag `modificado`.
- Rutas `autorizar` y `refrescar` para validar y renovar el JWT.
- Guards globales (`JwtAuthGuard`, `RolesGuard`) aplicados a toda la API, con rutas públicas marcadas explícitamente.
- Fix: ordenamiento por likes usando aggregation pipeline de dos pasos (cálculo de `likesCount` + reordenamiento de resultados con populate).

---

## Sprint 4 — Administración y estadísticas

**Frontend:**
- Botones de baja lógica de publicaciones visibles solo para administradores.
- Dashboard de usuarios (solo admin): listado, alta de nuevos usuarios, habilitar/deshabilitar.
- Dashboard de estadísticas: gráficos de publicaciones y comentarios por usuario y por rango de tiempo.
- PWA, pipes y directivas propias.

**Backend:**
- Módulo Usuarios: listado, alta, baja y rehabilitación, protegido por rol administrador.
- Módulo Estadísticas: endpoints para alimentar los gráficos del dashboard.

---

## Diseño y UX

- Diseño uniforme en toda la aplicación, sin HTML plano.
- Modales en lugar de `alert()`.
- Mensajes claros ante cada acción del usuario.
