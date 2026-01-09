Registro de Cambios - Proyecto La Nota Digital
Cambios Realizados (9de enero de 2026)
Registro de Cambios - Sesión de Desarrollo
1. Eliminación de Publicidad ✅
Archivo eliminado: page.tsx
Archivo eliminado: components/advertising-sidebar.tsx
Modificaciones: Removidos imports en layout.tsx
2. Implementación de Sistema de Transmisión en Vivo ✅
Archivos creados:

page.tsx - Panel de administración para controlar transmisiones
route.ts - API para leer/escribir configuración de stream
live-stream-player.tsx - Componente para reproducir streams
live-badge.tsx - Badge "EN VIVO" animado
live-stream.json - Archivo de configuración persistente
Soporta 4 plataformas:

YouTube (auto-convierte URLs a embed)
Twitch (convierte URLs de canal)
Facebook Live
URLs de embed directo
Características:

Toggle ON/OFF desde panel admin
Preview en tiempo real
Badge dinámico en header
Diseño profesional (bordes rojo, fondo blanco)
3. Configuración para Red Local y Remota ✅
Archivo modificado: api.ts

Función getApiUrl() que detecta automáticamente:
Red local (192.168.x.x) → Usa http://IP:5001/api
Acceso remoto → Usa ngrok
Timeout aumentado a 30s para ngrok
Header ngrok-skip-browser-warning agregado
Archivo eliminado: .env.local

La app ahora usa valores por defecto sin necesidad de archivo de configuración
4. Configuración de CORS para Desarrollo ✅
Archivo modificado: next.config.mjs
Agregado allowedDevOrigins para:
192.168.1.41
localhost
127.0.0.1
5. Interfaz de Usuarios Actualizada ✅
Archivo modificado: api.ts

Interfaz User ahora incluye:
id: number
nombre, apellido (campos reales del backend)
rol: UserRoleObject (estructura con id y nombre)
activo: boolean
createdAt, updatedAt
Función actualizada: getUsers()

Maneja múltiples formatos de respuesta
Logging detallado para debugging
6. Panel de Administrador Mejorado ✅
Archivo modificado: page.tsx
Tabla de usuarios muestra:
Nombre completo (nombre + apellido)
Email
Rol (LECTOR, ESCRITOR, PERIODISTA, ADMIN)
Fecha de registro
Opción para eliminar usuario
Logging mejorado para tracking de operaciones
Contador de usuarios registrados
7. Sistema de Subida de Imágenes para Artículos ✅
Archivos creados:

route.ts - Endpoint POST para subir imágenes
uploads - Directorio para almacenar imágenes
Archivo modificado: page.tsx

Opción para subir archivo de imagen local
Opción para usar URL de imagen
Preview en tiempo real
Validaciones: tipo (solo imágenes), tamaño (máx 5MB)
Botón para eliminar imagen seleccionada
Estado de carga mejorado durante upload
Archivo modificado: package.json

Sin necesidad de agregar librerías adicionales
Archivo modificado: .gitignore

public/uploads/* agregado para ignorar archivos subidos
8. Eliminación de Sistema de Favoritos ✅
Archivos modificados:
api.ts - Removidas funciones:

getFavorites()
addFavorite()
removeFavorite()
isFavorite()
getFavoriteArticles()
auth.ts - Removidas exportaciones de favoritos

page.tsx:

Removido import de funciones de favoritos
Removido estado isFav
Removido botón de favoritos
Removido handler handleToggleFavorite
📊 Resumen de Cambios por Tipo
Archivos Creados: 8

API endpoints, componentes, configuración
Archivos Eliminados: 4

Publicidad, favoritos (conceptualmente)
Archivos Modificados: 12

Configuración, componentes, páginas, librerías
Líneas de Código Agregadas: ~500+
Líneas de Código Removidas: ~200+

✨ Nuevas Características
✅ Transmisión en vivo con 4 plataformas
✅ Subida de imágenes para artículos
✅ Panel de administración mejorado
✅ Soporte para red local y remota automático
✅ Gestión de usuarios con roles (LECTOR, ESCRITOR, PERIODISTA, ADMIN)
🔧 Configuraciones Finales
API URL dinámico según contexto (local/remoto)
CORS configurado para desarrollo
Uploads persistentes en uploads
Live stream config en live-stream.json
