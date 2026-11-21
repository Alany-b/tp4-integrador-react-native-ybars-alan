# Biblioteca IPF

App de la biblioteca del Instituto Politécnico Formosa. Los alumnos consultan el catálogo, reservan libros y reciben un recordatorio antes de devolverlos. El personal entrega los libros respetando el orden de las reservas.

Trabajo Práctico N° 4 del Taller Complementario React Native II.

## Versiones

- Expo SDK 58 (expo 58.0.26)
- React Native 0.88.1
- React 19.3.0
- Expo Router 58
- TypeScript 6

## Cómo ejecutar el proyecto

1. Instalar las dependencias con `npm install`.
2. Iniciar el servidor con `npx expo start`.
3. Escanear el código QR con Expo Go en el teléfono. La computadora y el teléfono tienen que estar en la misma red.

Otros comandos:

- `npx tsc --noEmit` revisa los tipos. Antes hay que correr `npx expo start` una vez, porque ese comando genera los tipos de las rutas en `.expo/types`.
- `npx expo lint` revisa el código.
- `npm test` corre los tests de Pila y Cola.

Credenciales del personal: usuario `biblioteca` y clave `ipf2026`. Están en `src/constants/biblioteca.ts`.

## Árbol de rutas

```
src/app
├── _layout.tsx                 Stack raíz (provider del Context, Stack.Protected, anchor en (tabs))
├── (tabs)
│   ├── _layout.tsx             Tabs (expo-router/js-tabs)
│   ├── (catalogo)
│   │   ├── _layout.tsx         Stack de la pestaña Catálogo (anchor en index)
│   │   ├── index.tsx           /
│   │   └── libro
│   │       └── [isbn].tsx      /libro/[isbn]
│   └── reservas.tsx            /reservas
├── buscar.tsx                  /buscar?q=
├── escanear.tsx                /escanear
├── reservar
│   └── [isbn].tsx              /reservar/[isbn] (modal)
├── permisos
│   └── [recurso].tsx           /permisos/[recurso] (modal)
├── login.tsx                   /login (modal, solo sin sesión)
├── mostrador.tsx               /mostrador (solo con sesión)
├── reserva.tsx                 /reserva, redirige a /reservas
└── +not-found.tsx              cualquier otra URL
```

El grupo `(catalogo)` no agrega nada a la URL. Por eso `index.tsx` responde a `/` y el detalle responde a `/libro/[isbn]`, y los dos comparten el Stack propio de la pestaña.

En SDK 58 las pestañas se importan desde `expo-router/js-tabs`. El import `Tabs` desde `expo-router` quedó marcado como obsoleto.

## Organización de src

| Carpeta | Contenido |
|---|---|
| `src/app` | Solo rutas y layouts |
| `src/components` | Un componente por archivo |
| `src/hooks` | `useLibros`, `useBusqueda`, `usePermiso`, `useBiblioteca`, `useTema` |
| `src/lib` | API simulada, catálogo, permisos, notificaciones, guardado, fechas y reglas de reserva |
| `src/context` | `BibliotecaContext` con préstamos, listas de espera, recientes, avisos y sesión |
| `src/estructuras` | Clases `Pila` y `Cola`, y sus tests |
| `src/data` | Libros y listas de espera iniciales |
| `src/types` | Tipos de la app |
| `src/constants` | Tema (colores, tamaños, espacios) y configuración |

## Bloque plugins de app.json

JSON no admite comentarios. Por eso cada plugin se explica debajo del bloque.

```json
"plugins": [
  "expo-router",
  ["expo-splash-screen", { "backgroundColor": "#1F4E79", "image": "./assets/images/splash-icon.png", "imageWidth": 76 }],
  ["expo-camera", {
    "cameraPermission": "Usamos tu cámara para leer el código de barras de la contratapa y abrir la ficha del libro sin que tengas que escribir el ISBN.",
    "microphonePermission": false,
    "recordAudioAndroid": false,
    "barcodeScannerEnabled": true
  }],
  ["expo-notifications", { "color": "#1F4E79", "enableRemoteNotifications": false }]
]
```

- `expo-router`: activa el ruteo por archivos y el scheme `bibliotecaipf` para los deep links.
- `expo-splash-screen`: la pantalla de carga queda visible hasta que se leen los datos guardados.
- `expo-camera` con `cameraPermission`: es el texto que iOS muestra en el diálogo de la cámara.
- `expo-camera` con `microphonePermission: false`: la app no graba video, así que no declara el micrófono en iOS.
- `expo-camera` con `recordAudioAndroid: false`: no agrega `RECORD_AUDIO` en Android.
- `expo-camera` con `barcodeScannerEnabled: true`: deja activo el lector de códigos de barras.
- `expo-notifications` con `color`: es el color del ícono de la notificación en Android.
- `expo-notifications` con `enableRemoteNotifications: false`: la app solo usa notificaciones locales. No agrega el permiso de push de iOS.

## Tabla de permisos

| Recurso | Módulo | Cuándo se pide | Alternativa si se niega |
|---|---|---|---|
| Cámara | expo-camera (`useCameraPermissions` dentro de `usePermiso`) | Al tocar "Usar la cámara" en /escanear. Antes se muestra /permisos/camara | Escribir el ISBN a mano en la misma pantalla |
| Notificaciones | expo-notifications | Al activar "Recordarme" en un préstamo. Antes se muestra /permisos/notificaciones y en Android se crea el canal "prestamos" | El recordatorio y el aviso de libro listo aparecen dentro de la app, en /reservas |

## Justificación de blockedPermissions

Algunas librerías y la plantilla de Expo agregan permisos de Android que esta app no usa. La lista `android.blockedPermissions` los quita del manifiesto final.

| Permiso bloqueado | Por qué se bloquea |
|---|---|
| `RECORD_AUDIO` | La cámara solo lee códigos. No graba audio ni video |
| `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION` | La app no usa la ubicación |
| `READ_EXTERNAL_STORAGE` y `WRITE_EXTERNAL_STORAGE` | La app no lee ni guarda archivos del teléfono |
| `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` y `READ_MEDIA_AUDIO` | La app no abre la galería ni archivos multimedia |
| `SYSTEM_ALERT_WINDOW` | La app no dibuja ventanas sobre otras apps |

## Deep links de prueba

En Expo Go se reemplaza `bibliotecaipf://` por `exp://IP:8081/--/`.

| Link | Resultado esperado |
|---|---|
| `bibliotecaipf://libro/9789872601812` | Detalle de Ficciones, con el Catálogo debajo |
| `bibliotecaipf://libro/123` | Mensaje de ISBN inválido con link al Catálogo |
| `bibliotecaipf://buscar?q=borges` | Buscador con los resultados de Borges y las pestañas debajo |
| `bibliotecaipf://mostrador` | Sin sesión lleva al Catálogo |
| `bibliotecaipf://reserva` | Redirige a Mis reservas |
| `bibliotecaipf://escanear` | Escáner. Con la cámara bloqueada muestra "Abrir Ajustes" y el ingreso manual |
| `bibliotecaipf://cualquier-cosa` | Pantalla 404 con la URL |

## Datos de prueba

El catálogo tiene 17 libros en `src/data/libros.ts`. El Aleph y El túnel empiezan sin ejemplares y con una lista de espera. Cien años de soledad y La invención de Morel empiezan sin ejemplares y sin nadie esperando. Clean Code y Eloquent JavaScript tienen su ISBN real. Antes de entregar hay que cambiar dos libros por dos que tengas en casa, con el ISBN de su contratapa.

## Desafíos opcionales hechos

- Persistencia con AsyncStorage de préstamos, listas de espera, recientes e identificadores de notificaciones. La app no se muestra hasta terminar de leerlos.
- Tests de Pila y Cola con jest-expo (11 casos).
- Debounce de 300 ms en el buscador.
- Modo oscuro con `useColorScheme` y los colores de `tema.ts`.

## Salida de lint y tipos

```
> npx expo lint
(sin errores ni advertencias)

> npx tsc --noEmit
(sin errores)

> npm test
Test Suites: 2 passed, 2 total
Tests:       11 passed, 11 total
```
