# 🔐 Guía de Configuración de Sendcloud

Esta guía te ayudará a configurar tus credenciales reales de Sendcloud para hacer pruebas con la API real.

---

## Paso 1: Obtener tus Credenciales de Sendcloud

1. **Accede a tu cuenta de Sendcloud**: https://panel.sendcloud.sc
2. Ve a **Settings** (Configuración) en el menú lateral
3. Selecciona **Integration** (Integración)
4. Busca la sección de **API Keys**
5. Copia:
   - **Public Key** (Clave Pública)
   - **Secret Key** (Clave Secreta)

⚠️ **IMPORTANTE**: Estas claves son sensibles. No las compartas públicamente.

---

## Paso 2: Configurar tus Contratos en Sendcloud

Para que la app muestre correctamente el número de cuenta de tu ERP:

1. En Sendcloud, ve a **Settings > Carriers > My Contracts**
2. Para cada contrato que tengas configurado:
   - Haz click en **Edit** (Editar)
   - En el campo **Name** o **Nickname**, escribe tu **ID de ERP**
   - Ejemplo: Si tu cuenta de DHL es "V24059" en tu sistema, pon "V24059" como nombre
3. Guarda los cambios

**Ejemplo de configuración:**
```
Contrato 1: DHL Express
- Nombre: V24059

Contrato 2: DHL Standard  
- Nombre: V24060

Contrato 3: UPS Saver
- Nombre: U12345
```

---

## Paso 3: Configurar las Credenciales en el Backend

### Opción A: Editar el archivo .env directamente

1. Abre el archivo `.env` en la carpeta `rate-shopper-backend/`
2. Edita las siguientes líneas:

```env
PORT=3001
USE_MOCK=false
SENDCLOUD_PUBLIC_KEY=tu_public_key_aqui
SENDCLOUD_SECRET_KEY=tu_secret_key_aqui
```

**Ejemplo real:**
```env
PORT=3001
USE_MOCK=false
SENDCLOUD_PUBLIC_KEY=fcb1234567890abcdef
SENDCLOUD_SECRET_KEY=1a2b3c4d5e6f7g8h9i0j
```

### Opción B: Usar variables de entorno en terminal

Si prefieres no guardar las claves en el archivo:

```bash
export SENDCLOUD_PUBLIC_KEY="tu_public_key_aqui"
export SENDCLOUD_SECRET_KEY="tu_secret_key_aqui"
export USE_MOCK=false
npm start
```

---

## Paso 4: Reiniciar el Servidor Backend

**IMPORTANTE**: Debes reiniciar el servidor para que cargue las nuevas credenciales.

1. En la terminal donde está corriendo el backend, presiona `Ctrl+C`
2. Vuelve a ejecutar:
```bash
cd rate-shopper-backend
npm start
```

3. Deberías ver este mensaje:
```
🚀 Usando servicio REAL de Sendcloud
```

Si ves `🔧 Usando servicio MOCK de Sendcloud`, verifica que `USE_MOCK=false` en el `.env`

---

## Paso 5: Probar la Conexión

### Opción 1: Usar la Aplicación Web

1. Asegúrate que el frontend esté corriendo: http://localhost:5173
2. Carga tu archivo JSON de expedición
3. Cotiza las tarifas
4. Deberías ver tus contratos reales de Sendcloud

### Opción 2: Probar con cURL (Verificación directa)

```bash
curl -X POST http://localhost:3001/api/get-rates \
  -H "Content-Type: application/json" \
  -d '{
    "shipment": "TEST001",
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
        "kg": "5.00",
        "lar": "30",
        "anc": "40",
        "alt": "20"
      }
    ]
  }'
```

---

## Verificación de Respuesta

### ✅ Respuesta Exitosa

Deberías recibir algo como:

```json
{
  "success": true,
  "shipmentId": "TEST001",
  "results": [
    {
      "carrier": "DHL",
      "service": "DHL Express 12:00",
      "accountNumber": "V24059",
      "deliveryTime": "1-2",
      "price": 45.90,
      "currency": "EUR"
    },
    ...
  ]
}
```

### ❌ Errores Comunes

**1. Error 401 - Credenciales inválidas**
```json
{
  "error": true,
  "message": "Credenciales de Sendcloud inválidas. Verifica tus API keys."
}
```
**Solución**: Verifica que copiaste correctamente las credenciales.

**2. Error 400 - Código postal inválido**
```json
{
  "error": true,
  "message": "Parámetros inválidos: Invalid postal code"
}
```
**Solución**: Verifica que el código postal sea válido para el país destino.

**3. Error de conexión**
```json
{
  "error": true,
  "message": "No se pudo conectar con Sendcloud. Verifica tu conexión a internet."
}
```
**Solución**: Verifica tu conexión a internet y que puedas acceder a https://panel.sendcloud.sc

---

## 🔄 Volver al Modo Mock

Si quieres volver a usar los datos de prueba:

1. Edita `rate-shopper-backend/.env`:
```env
USE_MOCK=true
```

2. Reinicia el servidor:
```bash
Ctrl+C
npm start
```

---

## 📋 Checklist de Configuración

- [ ] Obtener Public Key de Sendcloud
- [ ] Obtener Secret Key de Sendcloud
- [ ] Configurar nombres de contratos en Sendcloud con IDs de ERP
- [ ] Editar archivo `.env` con las credenciales
- [ ] Cambiar `USE_MOCK=false`
- [ ] Reiniciar el servidor backend
- [ ] Verificar mensaje "🚀 Usando servicio REAL de Sendcloud"
- [ ] Probar con una cotización real

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs del servidor backend (aparecen en la terminal)
2. Verifica que las credenciales sean correctas en el panel de Sendcloud
3. Asegúrate de que tus contratos tengan nombres configurados
4. Prueba primero con el endpoint de health: http://localhost:3001/api/health

---

**¿Listo para configurar tus credenciales?** Sigue los pasos anteriores y podrás hacer cotizaciones reales con Sendcloud.
