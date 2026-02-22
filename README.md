# INVCAS - Inventario Familiar con OCR

PWA de inventario familiar con OCR (Tesseract.js) para escaneo de tickets.

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS v4** (Glassmorphism "Vidrio de Medianoche")
- **Zustand** (estado global)
- **Dexie.js** (IndexedDB local) / **Firebase Firestore** (producción)
- **Tesseract.js** (OCR offline y gratuito)
- **vite-plugin-pwa** (soporte offline)

## Inicio rápido

```bash
npm install
cp .env.example .env
npm run dev
```

## Variables de entorno

| Variable | Descripción | Valores |
|---|---|---|
| `VITE_DB_MODE` | Motor de datos | `local` (IndexedDB) / `firebase` |

## Arquitectura

```
src/
  types/          Tipos e interfaces
  services/       DataService (Local + Firebase) + dataFacade
  store/          Zustand store (useInventory)
  hooks/          useOCR (análisis de tickets)
  components/     CameraCapture, Layout
  pages/          Home, Scan, Inventory, TicketDetail, Settings
```

## Deploy a Firebase Hosting

```bash
npm run build
firebase login
firebase init hosting   # Selecciona "dist" como directorio público
firebase deploy
```

## Flujo de uso

1. Abre la app y toca "Escanear ticket"
2. Captura una foto del ticket (cámara o galería)
3. El OCR extrae: tienda, fecha, total y productos
4. Revisa y guarda el ticket
5. Consulta tu inventario y gastos

## Características del OCR

- ✅ **100% gratuito** - Sin API Keys ni costos
- ✅ **Funciona offline** - Procesa localmente
- ✅ **Soporte español** - Reconoce texto en español
- ✅ **Sin límites** - Procesa todas las imágenes que necesites
