# Rate Shopper WebApp

**Comparador de Tarifas Logísticas con integración Sendcloud**

Una aplicación web moderna para comparar tarifas de envío de múltiples contratos logísticos. Los operarios pueden cargar un archivo JSON con datos de expedición y obtener instantáneamente una tabla comparativa con todas las tarifas disponibles.

---

## 🚀 Características

- ✅ **Carga intuitiva de datos**: Drag & Drop o pegado de JSON
- ✅ **Validación en tiempo real**: Verificación instantánea de datos
- ✅ **Panel de revisión**: Vista previa de la expedición antes de cotizar
- ✅ **Comparación multicuenta**: Consulta todas las cuentas de Sendcloud simultáneamente
- ✅ **Tabla ordenable**: Ordena por precio o tiempo de tránsito
- ✅ **Highlights visuales**: Resalta la opción más barata y más rápida
- ✅ **Copy-to-clipboard**: Copia el número de cuenta con un click
- ✅ **Diseño premium**: Interfaz moderna con animaciones suaves
- ✅ **Mock API incluida**: Prueba sin credenciales reales

---

## 📋 Requisitos

- **Node.js**: v14 o superior
- **npm**: v6 o superior

---

## 🛠️ Instalación

### 1. Clonar o descargar el proyecto

El proyecto contiene dos carpetas principales:
- `rate-shopper-backend/` - Servidor API
- `rate-shopper-frontend/` - Aplicación React

### 2. Instalar Backend

```bash
cd rate-shopper-backend
npm install
```

### 3. Instalar Frontend

```bash
cd rate-shopper-frontend
npm install
```

---

## ▶️ Ejecutar la Aplicación

### Opción A: Ejecutar ambos servicios (Frontend + Backend)

**Terminal 1 - Backend:**
```bash
cd rate-shopper-backend
npm run dev
```
El servidor estará disponible en `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd rate-shopper-frontend
npm run dev
```
La aplicación se abrirá automáticamente en `http://localhost:5173`

### Opción B: Usar comandos desde la raíz

```bash
# Desde /Users/jota/Desktop/Desarrollo mailboxes/

# Terminal 1 - Backend
cd rate-shopper-backend && npm run dev

# Terminal 2 - Frontend  
cd rate-shopper-frontend && npm run dev
```

---

## 📝 Cómo Usar

### 1. Preparar JSON de expedición

Usa el archivo de ejemplo incluido: `expedicion0001000081_7BB0MOE9K_31-10-2025_10-34-49.json`

O crea uno con esta estructura:

```json
{
  "shipment": "1000081",
  "courier": "UPS",
  "account": "4813V3",
  "shipper": {
    "postalCode": "03203",
    "countryCode": "ES"
  },
  "recipient": {
    "postalCode": "75001",
    "countryCode": "FR"
  },
  "packages": [
    {
      "kg": "10.00",
      "lar": "30",
      "anc": "60",
      "alt": "50"
    }
  ]
}
```

### 2. Cargar en la aplicación

- **Opción 1**: Arrastra el archivo JSON a la zona de carga
- **Opción 2**: Haz click en "Seleccionar Archivo"
- **Opción 3**: Click en "pegar como texto" y pega el JSON

### 3. Revisar datos

Confirma que los datos extraídos sean correctos:
- Origen y destino
- Número de bultos
- Peso total

### 4. Cotizar

Haz click en "Cotizar Tarifas". El sistema consultará todas las cuentas y mostrará:
- Transportista y servicio
- Número de cuenta (ERP ID)
- Tiempo de tránsito
- Precio en €

### 5. Seleccionar opción

- Las opciones más baratas y rápidas están resaltadas en verde
- Haz click en el número de cuenta para copiarlo al portapapeles
- Ordena la tabla haciendo click en los encabezados "Coste" o "Tiempo"

---

## 🔧 Configuración

### Backend - Variables de Entorno

El backend usa el archivo `.env` para configuración. Por defecto viene configurado para usar el mock:

```env
PORT=3001
USE_MOCK=true
```

#### Para usar la API real de Sendcloud:

1. Edita `rate-shopper-backend/.env`:
```env
PORT=3001
USE_MOCK=false
SENDCLOUD_PUBLIC_KEY=tu_public_key_aqui
SENDCLOUD_SECRET_KEY=tu_secret_key_aqui
```

2. Las credenciales se obtienen desde el panel de Sendcloud en Settings > Integration

3. **IMPORTANTE**: Configura el "Nickname" de cada contrato en Sendcloud con el ID de tu ERP (ej: "V24059")

---

## 🏗️ Estructura del Proyecto

```
Desarrollo mailboxes/
├── rate-shopper-backend/
│   ├── server.js              # Servidor Express principal
│   ├── routes/
│   │   └── rates.js           # Endpoint /api/get-rates
│   ├── services/
│   │   └── sendcloud.mock.js  # Servicio mock de Sendcloud
│   ├── utils/
│   │   └── validator.js       # Validación de JSON
│   ├── package.json
│   └── .env
│
├── rate-shopper-frontend/
│   ├── src/
│   │   ├── App.jsx            # Componente principal
│   │   ├── components/
│   │   │   ├── UploadZone.jsx     # Zona de carga
│   │   │   ├── ShipmentReview.jsx # Panel de revisión
│   │   │   ├── ResultsTable.jsx   # Tabla de resultados
│   │   │   └── Toast.jsx          # Notificaciones
│   │   ├── index.css          # Estilos globales + Tailwind
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── expedicion0001000081...json    # Archivo de ejemplo
```

---

## 🎨 Stack Tecnológico

### Frontend
- **React 18**: Librería UI
- **Vite**: Build tool y dev server
- **TailwindCSS**: Framework CSS
- **Axios**: Cliente HTTP

### Backend
- **Node.js**: Runtime
- **Express**: Framework web
- **CORS**: Middleware para CORS
- **dotenv**: Variables de entorno

### API
- **Sendcloud v2**: Servicio de cotización (con mock incluido)

---

## 🧪 Datos Mock (PoC)

El servicio mock incluye **8 contratos simulados**:

| Transportista | Contratos | IDs ERP |
|--------------|-----------|---------|
| DHL | 3 | V24059, V24060, V24061 |
| UPS | 2 | U12345, U12346 |
| FedEx | 1 | F99999 |
| Correos Express | 2 | C88001, C88002 |

Los precios se ajustan automáticamente según el peso del envío.

---

## 🔐 Seguridad

- ✅ Las credenciales de API **nunca** están en el frontend
- ✅ Variables de entorno para secretos
- ✅ CORS configurado para localhost
- ✅ Validación estricta de entrada

---

## 📊 Rendimiento

- **Latencia objetivo**: < 5 segundos
- **Mock response time**: 500-1500ms (simulado)
- **Caching**: Lista de carriers cacheada 1 hora (en producción)

---

## 🐛 Troubleshooting

### El frontend no conecta con el backend
- Verifica que el backend esté corriendo en `http://localhost:3001`
- Revisa la consola del navegador para errores de CORS

### Error "JSON inválido"
- Asegúrate de que el JSON tenga todos los campos requeridos
- Verifica que `countryCode` sea formato ISO (2 letras mayúsculas)
- Confirma que los paquetes tengan dimensiones válidas

### El servidor no inicia
- Ejecuta `npm install` en la carpeta correspondiente
- Verifica que el puerto 3001 (backend) o 5173 (frontend) no estén en uso

---

## 📞 Soporte

Para integración con la API real de Sendcloud:
1. Obtén credenciales desde tu panel de Sendcloud
2. Configura los Nicknames de contratos con tus IDs de ERP
3. Actualiza el archivo `.env` en el backend
4. Reinicia el servidor

---

## 📄 Licencia

MIT

---

**Desarrollado para MailBoxes - Rate Shopper v1.0**
