# 🥖 Panadería Unión - Sistema de Gestión

Sistema integral de gestión de inventarios y solicitudes de stock para la cadena de panaderías más grande del Perú.

## 📋 Descripción del Proyecto

Este sistema permite:

### 🏠 **Homepage Promocional**
- Página de inicio atractiva con información de la panadería
- Productos destacados con ratings y disponibilidad
- Historia de la empresa y estadísticas
- Acceso al sistema de login

### 👥 **Sistema de Usuarios**
- **Empleados**: Gestión de solicitudes de stock para su sucursal
- **Administradores**: Control total del sistema y vista nacional de inventarios

### 📊 **Funcionalidades Principales**
- Gestión de inventarios por sucursal
- Solicitudes de stock a la central (Lima)
- Mapa interactivo del Perú mostrando estado de sucursales
- Dashboard de administración nacional
- Sistema de notificaciones y alertas

## 🚀 Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI (MUI)
- **Backend**: Supabase
- **Routing**: React Router v6
- **Styling**: Emotion (CSS-in-JS)

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPO]
   cd panaderia_union
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   - Crear archivo `.env` basado en `.env.example`
   - Configurar credenciales de Supabase:
     ```
     REACT_APP_SUPABASE_URL=tu-supabase-url
     REACT_APP_SUPABASE_ANON_KEY=tu-supabase-anon-key
     ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```
   
   O alternativamente:
   ```bash
   npm start
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── components/           # Componentes React
│   ├── HomePage.tsx     # Página principal promocional
│   └── LoginPage.tsx    # Sistema de autenticación
├── config/              # Configuraciones
│   └── supabase.config.ts
├── services/            # Servicios y API calls
│   └── supabase.service.ts
├── types/               # Definiciones TypeScript
│   └── index.ts
└── App.tsx              # Componente principal con routing
```

## 🗄️ Base de Datos (Supabase)

### Tablas Principales

1. **usuarios** - Información de empleados y administradores
2. **sucursales** - Datos de las sucursales por departamento
3. **productos** - Catálogo de productos de panadería
4. **stock** - Inventario por sucursal
5. **solicitudes_stock** - Pedidos de productos a la central
6. **solicitudes_stock_items** - Detalles de los pedidos

## 👤 Credenciales de Prueba

### Empleado
- **Email**: empleado@panaderiaunion.pe
- **Password**: password123

### Administrador
- **Email**: admin@panaderiaunion.pe
- **Password**: admin123

## 🎨 Diseño y UI

- **Colores principales**: 
  - Marrón principal: `#8B4513`
  - Marrón claro: `#D2691E`
  - Fondo: `#FFF8DC`
- **Tipografía**: Roboto
- **Iconografía**: Material Icons

## 📱 Responsive Design

El sistema está optimizado para:
- Desktop (1920x1080+)
- Tablet (768px+)
- Mobile (360px+)

## 🚧 Próximas Características

- [ ] Dashboard de empleados
- [ ] Dashboard de administradores
- [ ] Mapa interactivo del Perú
- [ ] Sistema de notificaciones en tiempo real
- [ ] Reportes y analytics
- [ ] App móvil con React Native

## 🤝 Contribución

1. Fork el proyecto
2. Crear una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto es privado y pertenece a Panadería Unión.

## 📞 Contacto

- **Email**: desarrollo@panaderiaunion.pe
- **Teléfono**: (01) 234-5678

---

**🥖 Panadería Unión** - *Tradición y calidad desde 1945*
