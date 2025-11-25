# 📦 Rate Shopper WebApp

Aplicación web full-stack para comparar tarifas de envío entre diferentes transportistas utilizando la API de Sendcloud.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## ✨ Características

- 🔍 **Comparación de tarifas** en tiempo real con la API de Sendcloud
- 📊 **Tabla interactiva** con ordenamiento por precio, tiempo de entrega, y transportista
- 📁 **Carga de JSON** con drag & drop o entrada manual
- 🎯 **Soporte multi-paquete** con cálculo automático de pesos
- 🔄 **Deduplicación inteligente** de métodos de envío
- 🎨 **Interfaz moderna** con TailwindCSS y animaciones suaves
- ⚡ **Modo mock** para desarrollo sin consumir API

## 🏗️ Arquitectura

```
rate-shopper/
├── rate-shopper-frontend/    # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── App.jsx           # Componente principal
│   │   └── index.css         # Estilos globales
│   └── package.json
│
└── rate-shopper-backend/      # Express.js + Sendcloud API
    ├── routes/                # Rutas de la API
    ├── services/              # Integración Sendcloud (real/mock)
    ├── utils/                 # Validadores y helpers
    └── server.js             # Servidor principal
```

## 🚀 Instalación

### Prerrequisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Cuenta de Sendcloud con API keys

### 1. Clonar el repositorio

```bash
git clone https://github.com/Jpubli/mailboxes.git
cd mailboxes
```

### 2. Instalar dependencias

#### Backend
```bash
cd rate-shopper-backend
npm install
```

#### Frontend
```bash
cd ../rate-shopper-frontend
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en `rate-shopper-backend/`:

```bash
cd ../rate-shopper-backend
cp .env.example .env
```

Edita `.env` con tus credenciales de Sendcloud:

```env
# API Keys de Sendcloud
SENDCLOUD_PUBLIC_KEY=tu_public_key_aqui
SENDCLOUD_SECRET_KEY=tu_secret_key_aqui

# Puerto del servidor
PORT=3001

# Modo (false = API real, true = datos mock)
USE_MOCK=false
```

> ⚠️ **Importante:** Nunca subas el archivo `.env` a GitHub. Ya está protegido en `.gitignore`.

## 🎯 Uso

### Modo Desarrollo

#### 1. Iniciar el backend
```bash
cd rate-shopper-backend
npm start
```

El servidor estará disponible en `http://localhost:3001`

#### 2. Iniciar el frontend (en otra terminal)
```bash
cd rate-shopper-frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Modo Producción

#### Backend
```bash
cd rate-shopper-backend
NODE_ENV=production npm start
```

#### Frontend
```bash
cd rate-shopper-frontend
npm run build
npm run preview
```

## 📖 Cómo usar la aplicación

### Opción 1: Subir JSON

1. Arrastra y suelta un archivo JSON con el formato de expedición
2. O haz click para seleccionar el archivo
3. Revisa los datos del envío
4. Haz click en "Obtener Tarifas"

### Opción 2: Entrada Manual

1. Cambia a modo "Manual"
2. Completa el formulario con:
   - País origen/destino
   - Código postal origen/destino
   - Peso y dimensiones del paquete
3. Haz click en "Obtener Tarifas"

### Formato del JSON

```json
{
  "shipment": "1000081",
  "shipper": {
    "countryCode": "ES",
    "postalCode": "03203"
  },
  "recipient": {
    "countryCode": "FR",
    "postalCode": "75001"
  },
  "packages": [
    {
      "kg": "10",
      "lar": "30",
      "anc": "60",
      "alt": "50"
    }
  ]
}
```

## 🔧 Configuración

### Usar datos Mock (desarrollo sin API)

En `rate-shopper-backend/.env`:
```env
USE_MOCK=true
```

Esto usará datos de ejemplo sin consumir tu cuota de API de Sendcloud.

### Cambiar puerto del backend

En `rate-shopper-backend/.env`:
```env
PORT=3001  # Cambia al puerto que prefieras
```

Y actualiza `rate-shopper-frontend/src/App.jsx`:
```javascript
const API_URL = 'http://localhost:3001';  // Ajusta el puerto
```

## 🛠️ Tecnologías

### Frontend
- **React 18** - Librería UI
- **Vite** - Build tool y dev server
- **TailwindCSS** - Estilos utility-first
- **Lucide React** - Iconos

### Backend
- **Express.js** - Framework web
- **Sendcloud API v2** - Integración de tarifas
- **CORS** - Políticas de origen cruzado
- **dotenv** - Gestión de variables de entorno

## 📊 Funcionalidades Técnicas

### Cálculo de Peso Volumétrico

La aplicación calcula automáticamente el peso volumétrico usando la fórmula estándar:

```
Peso Volumétrico (kg) = (Largo × Ancho × Alto en cm) / 5000
```

**Nota:** Actualmente desactivado para coincidir con el comportamiento del panel oficial de Sendcloud.

### Deduplicación de Métodos

El sistema filtra métodos duplicados priorizando:
- Métodos con rangos de peso específicos (ej: "UPS Standard 16-18kg")
- Sobre métodos genéricos (ej: "UPS® Standard")

### Batch Processing

Las llamadas a la API se procesan en lotes de 5 para evitar rate limiting.

## 🐛 Troubleshooting

### Error: API keys no válidas
```
Error: Unauthorized - Invalid API credentials
```
**Solución:** Verifica que tus `SENDCLOUD_PUBLIC_KEY` y `SENDCLOUD_SECRET_KEY` sean correctas.

### Error: CORS
```
Error: Access-Control-Allow-Origin
```
**Solución:** Asegúrate de que el backend esté corriendo en el puerto correcto (3001).

### Error: Módulos no encontrados
```
Error: Cannot find module
```
**Solución:** Ejecuta `npm install` en ambos directorios (backend y frontend).

## 📝 Notas sobre Precios

Los precios mostrados provienen directamente de la API pública de Sendcloud y pueden diferir ligeramente del panel oficial debido a:

- Contratos específicos de cuenta
- Descuentos negociados no reflejados en la API pública
- Recargos aplicados a nivel de cuenta

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propiedad de Mail Boxes Etc.

## 👤 Autor

**Juan Luis Navarro** - [@Jpubli](https://github.com/Jpubli)

## 🙏 Agradecimientos

- [Sendcloud](https://www.sendcloud.com/) - API de shipping
- [TailwindCSS](https://tailwindcss.com/) - Framework CSS
- [Vite](https://vitejs.dev/) - Build tool

---

**Última actualización:** Noviembre 2025
