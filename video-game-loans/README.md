# Sistema de Préstamos de Videojuegos 🎮

Un sistema completo para gestionar préstamos de videojuegos con diferentes roles de usuario y persistencia de datos mediante archivos JSON.

## 🚀 Características

- **Modo Oscuro/Claro**: Toggle completo de temas
- **Sistema de Usuarios**: Administradores y usuarios normales
- **Gestión de Juegos**: Agregar, eliminar y filtrar videojuegos
- **Sistema de Préstamos**: Solicitudes, aprobaciones y devoluciones
- **Persistencia**: Los datos se guardan en archivos JSON locales
- **Responsive**: Funciona en móviles y desktop

## 👥 Usuarios de Prueba

### Administrador
- **Email**: admin@gameloans.com
- **Contraseña**: 123456
- **Permisos**: Gestión completa del sistema

### Usuarios Normales
- **Email**: juan@email.com / **Contraseña**: 123456
- **Email**: maria@email.com / **Contraseña**: 123456
- **Permisos**: Solicitar préstamos y ver su historial

## 🛠️ Instalación

1. Clona o descarga el proyecto
2. Instala las dependencias:
   \`\`\`bash
   npm install
   \`\`\`
3. Ejecuta el servidor de desarrollo:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## 📁 Estructura de Datos

El sistema crea automáticamente una carpeta `/data` con los siguientes archivos:

- `games.json`: Información de los videojuegos
- `loans.json`: Registro de préstamos
- `loan-requests.json`: Solicitudes de préstamos

## 🎯 Funcionalidades por Rol

### Usuario Normal
- Ver juegos disponibles
- Solicitar préstamos
- Ver estado de solicitudes
- Ver préstamos activos

### Administrador
- Gestión completa de juegos
- Aprobar/rechazar solicitudes
- Gestionar préstamos activos
- Ver estadísticas del sistema

## 🚀 Despliegue

Este proyecto está listo para desplegarse en:
- **Vercel** (recomendado)
- **Netlify**
- **Railway**
- Cualquier plataforma que soporte Next.js

Los datos se persistirán automáticamente en el servidor mediante archivos JSON.

## 📝 Notas para Proyecto Universitario

- ✅ **Funcional**: Todos los datos se guardan y persisten
- ✅ **Sin Base de Datos**: Usa archivos JSON simples
- ✅ **Fácil de entender**: Código bien documentado
- ✅ **Completo**: Sistema de autenticación y roles
- ✅ **Responsive**: Funciona en todos los dispositivos

## 🎮 Juegos Precargados

El sistema incluye 8 videojuegos populares de diferentes consolas y géneros para demostrar todas las funcionalidades.
