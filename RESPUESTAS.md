# Respuestas – TP 4 App integradora "Biblioteca IPF"

Alumno: Alan Ybars

Las referencias a archivos usan rutas desde la raíz del proyecto. Los números de línea corresponden al último commit.

---

## Parte B · Estado, efectos y renderizado

### B1. El ciclo de vida de useLibros

El hook está en `src/hooks/useLibros.ts`.

a) Cuando el pedido sale bien hay dos renders.

| Render | libros | cargando | error | Qué lo provoca |
|---|---|---|---|---|
| 1 | `[]` | `true` | `null` | El montaje del Catálogo. Después del render corre el efecto (línea 21) y llama a `obtenerLibros()` |
| 2 | 17 libros | `false` | `null` | A los 800 ms llega la respuesta. `setLibros` y `setCargando(false)` se llaman juntos dentro del `.then` (líneas 26 y 27). React los agrupa y hace un solo render |

Cuando el pedido falla y la persona toca "Reintentar":

| Render | libros | cargando | error | Qué lo provoca |
|---|---|---|---|---|
| 1 | `[]` | `true` | `null` | El montaje |
| 2 | `[]` | `false` | mensaje de error | El `.catch` (líneas 31 a 36) llama a `setError` y `setCargando(false)` |
| 3 | `[]` | `true` | `null` | "Reintentar" llama a `setCargando(true)`, `setError(null)` y `setIntento` (líneas 44 a 47). React los agrupa en un render. Como `intento` cambió, corre la limpieza del efecto anterior y después el efecto nuevo |
| 4 | 17 libros | `false` | `null` | Llega la respuesta del segundo pedido |

En modo desarrollo con StrictMode React monta, desmonta y vuelve a montar el componente una vez más. Por eso en la consola pueden aparecer renders y efectos repetidos. En la versión final no pasa.

b) El Catálogo no se desmonta al cambiar a "Mis reservas". Las pestañas dejan montadas las pantallas que ya se abrieron y solo las ocultan. Tampoco se desmonta al abrir un detalle. El detalle se apila encima del Catálogo en el Stack de la pestaña, y el Catálogo queda montado debajo. Lo comprobé con un `console.log` temporal en la limpieza: no apareció en ninguno de los dos casos. Sí apareció al tocar "Reintentar".

En la práctica, la limpieza de `useLibros` corre en dos casos:

- Cuando cambia `intento`, es decir, al reintentar. La limpieza marca el pedido anterior como viejo.
- Cuando el componente se desmonta de verdad, por ejemplo al cerrar la app o en la recarga rápida del modo desarrollo.

c) `useEffect` espera que la función devuelva nada o una función de limpieza. Una función `async` siempre devuelve una Promise. React tomaría esa Promise como si fuera la limpieza, y no lo es. Lo resolví sin `async` en el efecto, con `.then` y `.catch` y una variable `activo` para la limpieza:

```ts
useEffect(() => {
  let activo = true;

  obtenerLibros()
    .then((datos) => {
      if (activo) {
        setLibros(datos);
        setCargando(false);
      }
    })
    .catch(() => {
      if (activo) {
        setError(MENSAJE_ERROR);
        setCargando(false);
      }
    });

  return () => {
    activo = false;
  };
}, [intento]);
```

En otros archivos usé la otra forma: declarar la función `async` dentro del efecto y llamarla. Está en `src/context/BibliotecaContext.tsx`, líneas 83 a 100, con la función `hidratar`.

d) Usé un contador `intento` en el estado, que está en el array de dependencias del efecto. `reintentar` le suma 1. React compara las dependencias, ve que `intento` cambió y vuelve a ejecutar el efecto.

Elegí un contador porque cambia siempre que se reintenta. Si usara `error` como dependencia, el efecto también correría cuando el error pasa a `null`. Además el pedido quedaría atado a un dato que no es el motivo real de pedir. Con un booleano, dos reintentos seguidos podrían dejar el mismo valor y el efecto no correría.

### B2. La condición de carrera del buscador

| Momento | Qué pasa | Sin limpieza: qué se ve | Con mi código: qué se ve |
|---|---|---|---|
| t = 0 ms | Escribe "bor" y se pide `buscarLibros("bor")` | "Buscando..." | "Buscando..." |
| t = 200 ms | Escribe "borges" y se pide `buscarLibros("borges")` | "Buscando..." | "Buscando..." |
| t = 500 ms | Llega la respuesta de "borges" | Los resultados de "borges" | Los resultados de "borges" |
| t = 1.400 ms | Llega la respuesta de "bor" | Los resultados de "bor", aunque el campo dice "borges" | Siguen los de "borges". La respuesta de "bor" se descarta |

En mi app los dos libros de Borges aparecen en las dos búsquedas. Pero si "bor" trajera otros libros, sin limpieza la pantalla mostraría resultados que no corresponden al texto escrito.

Además mi buscador tiene debounce de 300 ms. Con el debounce, el pedido de "bor" ni siquiera sale: a los 200 ms la limpieza cancela el temporizador antes de que llame a `buscarLibros`.

a) El efecto está en `src/hooks/useBusqueda.ts`, líneas 30 a 53. La limpieza hace dos cosas:

```ts
return () => {
  vigente = false;
  clearTimeout(temporizador);
};
```

`clearTimeout` cancela el pedido si todavía no salió. `vigente = false` marca la respuesta como vieja. Cuando esa respuesta llega, el `if (vigente)` de las líneas 39 y 44 no deja guardarla.

La limpieza se ejecuta cuando cambia `consulta` o `intento`, justo antes de correr el efecto nuevo. También se ejecuta si la pantalla se desmonta.

Además, el hook guarda junto con los libros la consulta a la que corresponden. Solo los muestra si coinciden con el texto actual (líneas 64 y 65). Así, mientras llega la respuesta nueva, se ve "Buscando..." y no los resultados anteriores.

b) No funciona. La función del `.then` es una clausura: guarda los valores de las variables del render en el que se creó el efecto. En ese render, `q` vale exactamente lo mismo que `texto`, porque los dos salen de la misma búsqueda. La comparación `texto === q` siempre da verdadero, y la respuesta vieja se guarda igual.

La función no "ve" el `q` nuevo que tiene el componente después. Para eso habría que leer un valor que cambie por fuera de la clausura, como un `useRef` con la última consulta, o usar la limpieza del efecto.

c) La URL se actualiza en cada letra, por ejemplo `/buscar?q=borg` y `/buscar?q=borges`. Uso `router.setParams` en `src/app/buscar.tsx`, línea 34. Cambia los parámetros de la misma pantalla sin crear una nueva. El botón atrás vuelve directamente a la pantalla anterior, el Catálogo.

Con `router.push` cada letra apilaría una pantalla de búsqueda nueva. Para salir habría que tocar atrás una vez por cada letra escrita.

### B3. Mutar o reemplazar

a) El texto sigue mostrando 0. `encolar` cambia el array interno de la cola, pero la referencia guardada en el estado es la misma. React no se entera del cambio porque no se llamó a ninguna función `set`, y no vuelve a renderizar.

b) Escribir en el `TextInput` llama a su `setState`. Eso hace un render nuevo del componente. En ese render se lee `espera.tamanio`, que ya vale 3 porque la cola se modificó tres veces. Por eso el número "salta".

Un error que aparece "a veces" es peor. Depende de que otra cosa provoque un render, y eso puede pasar o no. Es difícil de reproducir, puede pasar las pruebas y aparecer después. Un error que aparece siempre se ve enseguida y se corrige.

c) En el Context nunca modifico una cola guardada en el estado. Creo una cola nueva a partir de la anterior y guardo la nueva:

```ts
const cola = colas[isbn] ?? new Cola<string>();
const nueva = new Cola<string>(cola.aArray());
nueva.encolar(NOMBRE_ALUMNO);
setColas((anteriores) => ({ ...anteriores, [isbn]: nueva }));
```

Está en `src/context/BibliotecaContext.tsx`, líneas 182 a 185. Hago lo mismo con la Pila en `registrarVisto` (líneas 153 a 162) y al desencolar en el mostrador (líneas 267 a 269).

| Alternativa | Ventaja | Costo |
|---|---|---|
| Cola nueva a partir de la anterior (la mía) | React detecta el cambio porque la referencia es nueva. La cola vieja no cambia y puede servir para comparar | Copia el array en cada operación. Con listas de pocas personas no importa |
| Contador de versión | No copia datos | Hay que acordarse de subir el contador en cada cambio. Si me olvido una vez vuelve el error de B3. La cola sigue siendo mutable |
| useReducer | Todas las reglas quedan juntas en un reducer y son fáciles de probar | Más código. Dentro del reducer igual hay que crear colas nuevas |

### B4. ¿Dónde vive cada dato?

| Dato | Dónde vive en mi app | Por qué ahí y no en otro lugar |
|---|---|---|
| Texto del buscador | En la URL, en el parámetro `q` (`src/app/buscar.tsx`) | Así funciona el deep link `/buscar?q=borges`, y el texto no se pierde al volver a la pantalla. En el estado local no sobreviviría a un link |
| Préstamos y reservas | En el Context (`prestamos`), guardado con AsyncStorage | Los usan varias pantallas: detalle, confirmación, Mis reservas y mostrador. Tienen que durar aunque se cierre la app |
| Listas de espera | En el Context (`colas`, una Cola por ISBN), guardado con AsyncStorage | Las modifican la reserva y el mostrador, que son pantallas distintas |
| Vistos recientemente | En el Context (`recientes`, una Pila), guardado con AsyncStorage | Se cargan desde el detalle y se muestran en el Catálogo |
| Sesión del personal | En el Context (`sesionIniciada`) | La lee el layout raíz para `Stack.Protected`. No la guardo, así que al reiniciar la app se cierra sola |
| Ejemplares disponibles | Se calcula con `calcularDisponibles` (`src/lib/biblioteca.ts`, línea 6) | Sale de los ejemplares del libro menos los préstamos. Si lo guardara aparte, podría quedar distinto de los préstamos reales |
| Estado del permiso de cámara | En el sistema operativo. `usePermiso` lo consulta y guarda una copia en estado local | La persona puede cambiarlo en Ajustes sin pasar por la app. Por eso se vuelve a consultar al enfocar la pantalla y al volver a la app |
| Identificador de la notificación programada | En el préstamo (`notificacionId`), dentro del Context y guardado con AsyncStorage | Hace falta para cancelar la notificación al desactivar o devolver, aunque la app se haya cerrado |

Cuando cambia el `value` del Context, se vuelven a renderizar todos los componentes que llaman a `useBiblioteca()`. El `value` está memorizado con `useMemo` (línea 309 del Context), así que solo cambia cuando cambia alguno de sus datos.

La pantalla del Catálogo en sí no usa el Context. Pero `VistosRecientes` y `LinkPersonal` sí lo usan, así que se re-renderizan cuando se activa un recordatorio en la otra pestaña, aunque lo que muestran no cambie.

Para evitarlo podría separar el Context en varios (recientes, préstamos, sesión) o usar una librería con selectores. En una app de este tamaño no vale la pena. Son dos componentes chicos y el render no se nota. Además el proyecto tiene React Compiler activo (`app.json`), que evita repetir trabajo dentro de cada componente.

---

## Parte C · Navegación y rutas

### C1. La pila en mi app

| # | Acción | Pilas resultantes |
|---|---|---|
| 1 | Abre la app | Stack raíz: `[(tabs)]`. Pestaña activa: Catálogo. Stack del Catálogo: `[index]` |
| 2 | Toca un libro del Catálogo | Stack raíz: `[(tabs)]`. Stack del Catálogo: `[index, libro/[isbn]]` |
| 3 | Toca "Reservar" | Stack raíz: `[(tabs), reservar/[isbn]]` (modal). Stack del Catálogo: `[index, libro/[isbn]]` |
| 4 | Toca "Confirmar" | Stack raíz: `[(tabs)]`. Pestaña activa: Mis reservas. Stack del Catálogo sigue en `[index, libro/[isbn]]` |
| 5 | Toca atrás (Android) | Stack raíz: `[(tabs)]`. Las pestañas vuelven a la primera, Catálogo. Stack del Catálogo: `[index, libro/[isbn]]` |
| 6 | Toca la pestaña "Catálogo" | Stack raíz: `[(tabs)]`. Stack del Catálogo: `[index]` |

a) En el paso 4 usé `router.dismissTo('/reservas')` (`src/app/reservar/[isbn].tsx`, línea 58). Cierra las pantallas del Stack raíz hasta llegar a la que contiene `/reservas`, que es `(tabs)`, y ahí cambia a la pestaña Mis reservas. El modal sale de la pila, así que "atrás" no vuelve a la confirmación.

- Con `push`, Mis reservas quedaría encima del modal. Al tocar atrás volvería a aparecer la confirmación y se podría confirmar dos veces.
- Con `replace`, el modal se cambiaría por otra entrada de `(tabs)`, y la pila podría quedar con dos `(tabs)` iguales.
- `dismissTo` es la única que cierra el modal y lleva a la pestaña que ya existe.

b) Al volver a la pestaña Catálogo en el paso 5, la persona ve el detalle del libro, porque la pestaña conserva su propia pila. En el paso 6 toca la pestaña que ya está activa, y el Stack vuelve a su primera pantalla: se ve el Catálogo.

Me parece correcto. Al volver a una pestaña la persona encuentra lo que dejó. Y si quiere ir al inicio, le alcanza con tocar otra vez la pestaña, que es el comportamiento habitual en Android y en iOS.

### C2. El escáner que dispara de más

a) Cada llamada a `router.push` se agrega a la cola de acciones de navegación, igual que en el TP 2. Si `onBarcodeScanned` se dispara diez veces mientras el código sigue frente a la cámara, se encolan diez navegaciones. Quedarían diez detalles iguales apilados, y la persona tendría que tocar atrás diez veces.

b) Usé `useRef` (`src/app/escanear.tsx`, línea 44, y el control en la línea 54). Un `useState` en `true` no alcanza. `setState` no cambia el valor en el momento: pide un render nuevo. Hasta que ese render ocurre, todas las llamadas de `onBarcodeScanned` que ya están en camino usan la clausura vieja, donde el estado sigue en `false`, y todas navegan. El `useRef` cambia `ref.current` en el acto y sin render, así que la segunda lectura ya ve `true`.

c) Uso `router.replace` (línea 50) porque el escáner ya cumplió su función. Así sale de la pila y "atrás" desde el detalle lleva al Catálogo. Con `push`, el escáner quedaría debajo del detalle. Al tocar atrás, la persona volvería a la cámara, que podría leer de nuevo el mismo código.

d) Si el ISBN no está en el catálogo, la app muestra un aviso arriba del campo manual: "El libro con ISBN ... no está en el catálogo. Podés escanear otro." La cámara sigue activa (líneas 57 a 62). Para que no aparezca diez veces, guardo en otro `useRef` el último código desconocido (línea 45). Solo actualizo el aviso si el código leído es distinto del anterior.

### C3. Deep links y rutas protegidas

| Link | Qué ve la persona | Qué queda debajo en la pila | Qué parte de mi código lo decide |
|---|---|---|---|
| `bibliotecaipf://libro/9789872601812` | El detalle de Ficciones | El Catálogo y las pestañas | `anchor: 'index'` en `src/app/(tabs)/(catalogo)/_layout.tsx` y `anchor: '(tabs)'` en `src/app/_layout.tsx` |
| `bibliotecaipf://libro/123` | El mensaje "Ese ISBN no es válido" y el link "Volver al catálogo" | El Catálogo y las pestañas | `esIsbnValido` en `src/app/(tabs)/(catalogo)/libro/[isbn].tsx`, línea 66 |
| `bibliotecaipf://buscar?q=borges` | El buscador con los libros de Borges | Las pestañas, con el Catálogo | `anchor: '(tabs)'` en `src/app/_layout.tsx`, línea 12 |
| `bibliotecaipf://mostrador` (sin sesión) | El Catálogo. El mostrador no existe sin sesión | Nada | `Stack.Protected guard={sesionIniciada}` en `src/app/_layout.tsx`, líneas 41 a 43 |
| `bibliotecaipf://reserva` | Mis reservas | Las pestañas | `<Redirect href="/reservas" />` en `src/app/reserva.tsx` |
| `bibliotecaipf://escanear` (cámara bloqueada) | El escáner con el texto de cámara bloqueada, "Abrir Ajustes" y el ingreso manual | Las pestañas, con el Catálogo | `usePermiso('camara')` y el estado `bloqueado` en `src/app/escanear.tsx` |

El link `/libro/123` llega a la pantalla de detalle porque `[isbn]` es un segmento dinámico. Expo Router acepta cualquier texto en esa posición y no sabe qué es un ISBN válido. La responsabilidad de responder bien es de la pantalla. Tiene que validar el parámetro y, si no sirve, mostrar un mensaje claro con una salida. Mi detalle distingue dos casos: un ISBN mal formado y un ISBN bien formado que no está en el catálogo.

### C4. Foco, montaje y primer plano

a)

- `useEffect` con `[]` detecta el montaje del componente. Corre una sola vez, cuando la pantalla se crea.
- `useFocusEffect` detecta cuando la pantalla recibe el foco dentro de la navegación: al abrirla, al volver a su pestaña o al cerrarse una pantalla que estaba encima.
- `AppState` detecta cuando la app entera pasa a primer plano (`active`) o a segundo plano (`background`).

b) Si la persona va a Ajustes y vuelve, solo se entera `AppState`. Para la navegación la pantalla nunca perdió el foco, y el componente no se volvió a montar. Si en cambio va a la pestaña Catálogo y vuelve a "Mis reservas", se entera `useFocusEffect`. `AppState` no cambia porque la app nunca salió de primer plano, y `useEffect` con `[]` no corre porque la pestaña no se desmontó.

c) Uso dos: `useFocusEffect` y `AppState`, en `src/hooks/usePermiso.ts`, líneas 40 a 60. Los dos llaman a la misma función `consultar`. Con los dos, la pantalla se actualiza en todos los casos: al volver de Ajustes, al cambiar de pestaña y al cerrarse la pantalla previa de permisos, que es un modal encima.

Si usara solo `useEffect` con `[]`, Mis reservas mostraría "Notificaciones bloqueadas" aunque la persona las haya habilitado en Ajustes, hasta cerrar y abrir la app.

---

## Parte D · Permisos en mi app

### D1. Recorrido completo de la cámara

Android 14, app recién instalada.

| # | Acción | Qué muestra mi app | status | canAskAgain |
|---|---|---|---|---|
| 1 | Toca "Escanear" por primera vez | El escáner con "Para leer el código de barras necesitamos usar la cámara", el botón "Usar la cámara" y el ingreso manual. Al tocar el botón se abre /permisos/camara con "Continuar" | `undetermined` | `true` |
| 2 | "Continuar" y "No permitir" | Se cierra el modal y vuelve al escáner con el mismo texto y el botón "Usar la cámara" | `denied` | `true` |
| 3 | Toca "Escanear" otra vez | Lo mismo que en el paso 2. La pantalla previa sigue mostrando "Continuar" | `denied` | `true` |
| 4 | "Continuar" y "No permitir" | Android toma la segunda negativa como definitiva. La app muestra "La cámara está bloqueada...", "Abrir Ajustes" y el ingreso manual | `denied` | `false` |
| 5 | Toca "Escanear" otra vez | Lo mismo que en el paso 4. El sistema ya no muestra el diálogo | `denied` | `false` |
| 6 | "Abrir Ajustes", habilita la cámara y vuelve a la app | La cámara se activa sola y el escáner queda listo para leer | `granted` | `true` |

a) En iOS el resultado cambia en el paso 2. iOS muestra el diálogo una sola vez. La primera negativa ya es definitiva: `status` queda en `denied` y `canAskAgain` en `false`. En el paso 3 la app ya muestra "La cámara está bloqueada" y "Abrir Ajustes", y la pantalla previa cambia "Continuar" por "Abrir Ajustes". El paso 4 no existe en iOS, porque el diálogo no vuelve a aparecer.

b) La decisión está en `src/lib/permisos.ts`, línea 13:

```ts
if (respuesta.canAskAgain) {
  return 'preguntable';
}
return 'bloqueado';
```

Y la pantalla previa la usa en `src/components/PantallaPermiso.tsx`, líneas 85 a 89:

```tsx
{bloqueado ? (
  <Boton titulo="Abrir Ajustes" icono="settings-outline" onPress={abrirAjustes} />
) : (
  <Boton titulo="Continuar" onPress={continuar} />
)}
```

Usa el campo `canAskAgain`. Mirar `status` no alcanza, porque vale `denied` tanto después de la primera negativa en Android, cuando todavía se puede preguntar, como cuando el permiso está bloqueado. Solo `canAskAgain` dice si el sistema va a mostrar el diálogo otra vez.

c) Se entera el listener de `AppState` de `src/hooks/usePermiso.ts`, líneas 50 a 60. Cuando la app vuelve a estar `active`, consulta el permiso de nuevo y el estado pasa a `concedido`. Si esa parte no existiera, la app seguiría mostrando "La cámara está bloqueada" aunque ya esté habilitada, hasta que la persona salga de la pantalla y vuelva a entrar.

### D2. Notificaciones y consistencia

a) Si no la cancelara, a los 15 segundos llegaría "Acordate de devolver..." de un libro que ya se devolvió. La persona recibiría un aviso falso y dejaría de confiar en los recordatorios. Por eso `devolver` cancela la notificación antes de borrar el préstamo (`src/context/BibliotecaContext.tsx`, líneas 207 a 217). `desactivarRecordatorio` hace lo mismo (líneas 191 a 205).

b) El identificador se guarda en el préstamo, en el campo `notificacionId`, dentro del Context. Si la app se cierra antes de que llegue, la notificación no se pierde: la programó el sistema operativo y llega igual.

El problema es el identificador. Si solo estuviera en memoria, se perdería al cerrar la app. Después ya no habría forma de cancelar esa notificación al devolver el libro, y llegaría un recordatorio de un libro devuelto.

Lo resolví de dos maneras:

- Guardo los préstamos, con su `notificacionId`, en AsyncStorage (`src/lib/almacenamiento.ts`).
- Al abrir la app, comparo los identificadores guardados con las notificaciones que siguen programadas (`getAllScheduledNotificationsAsync`). Si una ya no existe, porque ya llegó o se canceló, apago el interruptor de ese préstamo. Lo hace `sincronizarPrestamo` en `src/lib/biblioteca.ts`, línea 69, que se llama al cargar (línea 93 del Context).

c) Desde Android 13 las notificaciones necesitan el permiso `POST_NOTIFICATIONS`, que se pide en tiempo de ejecución. Android muestra ese diálogo recién cuando la app tiene al menos un canal creado. Si se pide antes de crear el canal, el pedido puede no mostrar nada. Por eso `pedirPermisoNotificaciones` llama primero a `crearCanalPrestamos` (`src/lib/notificaciones.ts`).

En Android 12 o anterior el permiso de notificaciones no existe como diálogo. La app puede notificar desde que se instala, y la persona solo puede desactivarlas en Ajustes. El canal sigue siendo necesario desde Android 8 para mostrar la notificación, pero no hay diálogo que esperar.

d) Si el permiso está denegado, me entero con un aviso dentro de la app, en la parte de arriba de Mis reservas. El código está en `src/context/BibliotecaContext.tsx`, líneas 280 a 289:

```ts
const mensaje = `Ya podés retirar "${titulo}" en el mostrador. Lo tenés prestado por ${DIAS_PRESTAMO} días.`;
if (await notificacionesPermitidas()) {
  try {
    await avisarLibroListo(titulo);
  } catch {
    agregarAviso(mensaje);
  }
} else {
  agregarAviso(mensaje);
}
```

Consulta el permiso en ese momento. `notificacionesPermitidas` llama a `getPermissionsAsync`. Importa porque el permiso puede cambiar en cualquier momento desde Ajustes. Con un valor guardado de antes, la app podría intentar notificar sin permiso y la persona no se enteraría de nada. O al revés: podría mostrar el aviso dentro de la app cuando ya podía mandar una notificación.

### D3. Lo que mi app pide y lo que no

Lo verifiqué generando los archivos nativos con `npx expo prebuild` y revisando los manifiestos de las librerías.

| Plataforma | Permiso o clave declarada | Función de la app que lo justifica | ¿Quién lo agrega? |
|---|---|---|---|
| Android | `CAMERA` | Leer el código de barras en /escanear | El plugin de expo-camera |
| Android | `POST_NOTIFICATIONS` | Recordatorio de devolución y aviso de libro listo | expo-notifications |
| Android | `RECEIVE_BOOT_COMPLETED` | Volver a programar las notificaciones si se reinicia el teléfono | expo-notifications |
| Android | `VIBRATE` | Vibración al llegar una notificación | La plantilla de Expo |
| Android | `INTERNET` | Conexión con el servidor de desarrollo. En una app real, la API | La plantilla de Expo y React Native |
| iOS | `NSCameraUsageDescription` | El texto del diálogo de la cámara | El plugin de expo-camera, con mi texto de `cameraPermission` |
| iOS | Notificaciones locales | No necesitan una clave en Info.plist. El permiso se pide en tiempo de ejecución | expo-notifications |

Los permisos que bloqueo con `blockedPermissions` aparecen en el manifiesto con `tools:node="remove"`, así que no llegan a la app final. Por ejemplo: `RECORD_AUDIO`, ubicación, almacenamiento, galería y `SYSTEM_ALERT_WINDOW`.

a) expo-camera agrega `RECORD_AUDIO` por defecto porque la cámara también puede grabar video con sonido. Mi app solo lee códigos de barras, así que no lo necesita. Lo evito en tres lugares de `app.json`:

```json
[
  "expo-camera",
  {
    "cameraPermission": "Usamos tu cámara para leer el código de barras de la contratapa y abrir la ficha del libro sin que tengas que escribir el ISBN.",
    "microphonePermission": false,
    "recordAudioAndroid": false,
    "barcodeScannerEnabled": true
  }
]
```

y en la lista de Android:

```json
"blockedPermissions": [
  "android.permission.RECORD_AUDIO",
  ...
]
```

`recordAudioAndroid: false` evita que el plugin lo agregue. `blockedPermissions` lo quita aunque otra librería lo agregue. `microphonePermission: false` hace lo mismo con el micrófono en iOS.

b) Usaría `expo-image-picker` con `launchImageLibraryAsync`. En Android 13 o superior y en iOS 14 o superior, abre el selector de fotos del sistema. La persona elige una foto y la app recibe solo esa. No hace falta pedir permiso de galería. En versiones viejas de Android el paquete pide permiso de lectura de almacenamiento. Además tendría que sacar `READ_MEDIA_IMAGES` y `READ_EXTERNAL_STORAGE` de `blockedPermissions` si los necesitara.

No alcanza con una actualización OTA. Una OTA solo cambia el código JavaScript y los archivos. `expo-image-picker` trae código nativo que no está en la app instalada, y cambia el plugin y la configuración nativa. Hace falta una build nueva. En Expo Go funcionaría sin build porque ya trae ese módulo, pero la app real no.

c) En Expo Go no pude verificar del todo:

- El texto de propósito de la cámara. Expo Go muestra su propio texto, porque el diálogo usa el Info.plist de Expo Go y no el de mi app.
- `blockedPermissions` y `recordAudioAndroid`. En Expo Go se usa el manifiesto de Expo Go, que declara muchos permisos.
- El canal "prestamos" en Android. Expo Go tiene sus propios canales y limitaciones con las notificaciones.

Lo verificaría de dos formas:

- Generando los archivos nativos con `npx expo prebuild` y revisando `AndroidManifest.xml` e `Info.plist`, que es lo que hice para la tabla.
- Con una development build (`npx expo run:android` o `eas build --profile development`), instalada en el teléfono. Ahí se ve el diálogo con mi texto, y en Ajustes del teléfono aparece el canal "Préstamos".

---

## Parte E · Buenas prácticas y decisiones de diseño

### E1. Revisión de código

a) Problemas encontrados:

| # | Línea | Tipo | Por qué sucede | Cómo lo corregiría |
|---|---|---|---|---|
| 1 | 18 a 20 | Error de ejecución y rendimiento | El efecto no tiene array de dependencias y corre después de cada render. Cada respuesta llama a `setLibros` con un array nuevo, eso provoca un render y el efecto vuelve a pedir. Queda en un bucle infinito de pedidos | Usar el hook `useLibros`, con dependencias y limpieza |
| 2 | 19 | Error de ejecución | La promesa no tiene `.catch`. Una de cada cinco veces falla y queda un rechazo sin manejar. La persona no ve ningún mensaje | Manejar el error y mostrar un estado de error con "Reintentar" |
| 3 | 19 | Advertencia | No hay limpieza. Si la pantalla se desmonta, la respuesta igual llama a `setLibros` | Variable `activo` en la limpieza |
| 4 | 13 a 16 | Mala práctica (puede causar rechazo en la tienda) | Pide cámara y notificaciones apenas se abre el Catálogo, sin contexto y sin pantalla previa. Ni siquiera usa el resultado | Pedir la cámara al ir a escanear y las notificaciones al activar "Recordarme", con la pantalla previa |
| 5 | 16 | Advertencia | `pedirPermiso` se usa en el efecto pero no está en el array de dependencias | No pedir permisos en este efecto |
| 6 | 10 y 22 | Mala práctica | Se usa `any`, así que TypeScript no revisa nada de los libros | Usar el tipo `Libro` |
| 7 | 11 | Advertencia | `permiso` se declara y no se usa | Sacarlo |
| 8 | 22 a 30 | Rendimiento | `Fila` se declara dentro de `Catalogo`. En cada render es un componente nuevo, y React desmonta y vuelve a montar todas las filas | Declararlo a nivel de módulo en `src/components/FilaLibro.tsx` |
| 9 | 25 | Mala práctica | Estilos en línea y colores fijos (`#333`). No funciona en modo oscuro y repite valores | `StyleSheet.create` con los valores de `tema.ts` |
| 10 | 24 | Mala práctica | La ruta se arma concatenando texto. Con rutas tipadas no se revisa | `router.push({ pathname: '/libro/[isbn]', params: { isbn } })` |
| 11 | 33 a 36 | Rendimiento | `ScrollView` con `map` dibuja todos los libros juntos | `FlatList` |
| 12 | 35 | Advertencia | `key={i}` usa el índice. Si la lista cambia de orden, React confunde las filas | `keyExtractor` con el ISBN |
| 13 | 37 a 39 | Mala práctica de accesibilidad | Botón con solo un ícono, sin `accessibilityRole` ni `accessibilityLabel`. Un lector de pantalla no sabe qué hace | Agregar rol y etiqueta, y un área de 44 × 44 |
| 14 | 32 a 41 | Mala práctica | No hay estado de carga, de error ni de vacío. Mientras carga se ve una pantalla en blanco | `ListEmptyComponent` con los tres estados |
| 15 | 5 y 6 | Mala práctica | El Catálogo importa cámara y notificaciones, que no son su responsabilidad | Sacar esos imports |

b) Durante el primer minuto:

1. Primer render con `libros = []`.
2. Corre el efecto y pide los libros.
3. A los 800 ms llega la respuesta, `setLibros` guarda un array nuevo y hay un render.
4. Como el efecto no tiene dependencias, vuelve a correr y pide otra vez.

Eso se repite cada 800 ms, unas 75 veces por minuto. La lista parece estable, pero la app trabaja todo el tiempo y gasta batería. Una de cada cinco respuestas falla. Como no hay `.catch`, cada falla deja un rechazo sin manejar, y en desarrollo aparece un aviso de error.

Si `obtenerLibros()` devolviera siempre el mismo array, el bucle se cortaría en la segunda vuelta. La primera vez `setLibros` cambia de `[]` al array, hay render y el efecto pide otra vez. La segunda vez `setLibros` recibe el mismo array. React compara con `Object.is`, ve que no cambió y no vuelve a renderizar. Sin render, el efecto no corre de nuevo. Es una diferencia peligrosa: con la API simulada, que devuelve copias, el bucle nunca termina.

c) La pantalla reescrita es mi Catálogo, `src/app/(tabs)/(catalogo)/index.tsx`:

```tsx
export default function PantallaCatalogo() {
  const estilos = useEstilos(crearEstilos);
  const { libros, cargando, error, reintentar } = useLibros();

  function contenidoSinLibros() {
    if (cargando) {
      return <EstadoCargando mensaje="Cargando el catálogo..." />;
    }
    if (error) {
      return <EstadoError mensaje={error} textoAccion="Reintentar" onAccion={reintentar} />;
    }
    return <EstadoVacio mensaje="Por ahora no hay libros en el catálogo." />;
  }

  return (
    <FlatList
      style={estilos.lista}
      contentContainerStyle={estilos.contenido}
      data={cargando || error ? [] : libros}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => <FilaLibro libro={item} />}
      ListHeaderComponent={<EncabezadoCatalogo />}
      ListEmptyComponent={contenidoSinLibros()}
    />
  );
}
```

El botón de escanear está en `src/components/AccesosCatalogo.tsx`, con texto, rol de botón y 44 de alto mínimo. La cámara se pide recién en /escanear, después de la pantalla previa.

d) El que podría provocar el rechazo en una tienda es el de las líneas 13 a 16: pedir cámara y notificaciones al abrir la app, sin relación con lo que la persona está haciendo. Apple exige que cada permiso se pida cuando se usa la función y con un texto que explique para qué. Pedir la cámara en una lista de libros no tiene justificación visible.

El que haría que una persona la desinstale primero también empieza en esa parte. Lo primero que ve son dos diálogos de permisos sin explicación, y eso genera desconfianza. A eso se suma el bucle de las líneas 18 a 20, que gasta batería y datos todo el tiempo, y el botón de cámara chico y sin etiqueta.

### E2. Organización y acoplamiento

a) Las importaciones van siempre "hacia abajo":

```
app ──────────► components, hooks, lib, constants, context, types
components ───► hooks, lib, constants, types
hooks ────────► context, lib, constants, types
context ──────► lib, estructuras, data, constants, types
lib ──────────► data, estructuras, constants, types
data ─────────► types
estructuras ──► (nada)
constants ────► types
types ────────► (nada)
```

No hay importaciones hacia arriba. Ningún hook ni componente importa algo de `src/app`. `usePermiso` importa `useFocusEffect` desde la librería `expo-router`, no desde mis rutas.

Si un hook importara algo de `src/app` sería un problema por tres motivos:

- Se crearían dependencias circulares, porque las pantallas importan los hooks.
- Expo Router trata cada archivo de `src/app` como una ruta, así que mover o renombrar una pantalla rompería el hook.
- El hook dejaría de poder usarse en otra pantalla.

b) Si el catálogo viniera de una API real cambiarían:

- `src/lib/api.ts`, con los pedidos reales.
- `src/lib/catalogo.ts`, porque `buscarLibroPorIsbn` y `obtenerTitulo` hoy leen `LIBROS` en el momento y pasarían a ser asíncronas.
- Las pantallas que usan esas funciones en el render: el detalle, la confirmación de reserva, el escáner y las tarjetas de Mis reservas y del mostrador. Necesitarían un estado de carga.

La lista tiene más de dos archivos. Eso muestra que mi diseño depende de que el catálogo esté siempre disponible en memoria. La forma de pedir los datos quedó separada en `api.ts`, pero la búsqueda por ISBN no. Lo mejorable sería un hook `useLibro(isbn)` que oculte si el dato viene de memoria o de la red, para que las pantallas no cambien.

c) Con `<ConPermiso recurso="camara">`:

- Ganaría que el escáner quedaría más corto y que el patrón se repetiría igual en todas las pantallas.
- Perdería control sobre qué se muestra en cada estado. Mi escáner tiene que mostrar el ingreso manual en los cuatro estados, y un mensaje distinto en "preguntable" y en "bloqueado". Un componente que envuelve tiende a ocultar o reemplazar a sus hijos.
- La pantalla previa es una ruta modal y no un componente, así que el envoltorio igual tendría que navegar.

Para las notificaciones no me serviría. No hay una pantalla que envolver: el permiso se pide al tocar un interruptor, y después de pedirlo hay que seguir con una acción, programar el recordatorio. Un hook como `usePermiso`, que devuelve el estado y la función `pedir`, se adapta a los dos casos. Por eso me quedé con el hook.

### E3. Mapa de fallas

| Situación | Qué ve la persona | Dónde se maneja |
|---|---|---|
| `obtenerLibros()` falla | "No pudimos cargar el catálogo. Revisá tu conexión y probá de nuevo." con el botón "Reintentar". Arriba siguen visibles los recientes y los botones de Buscar y Escanear | `src/hooks/useLibros.ts`, líneas 31 a 36, y `src/app/(tabs)/(catalogo)/index.tsx`, líneas 27 a 35 |
| Se abre `/libro/abc` | "Ese ISBN no es válido" con el link "Volver al catálogo" | `src/app/(tabs)/(catalogo)/libro/[isbn].tsx`, líneas 66 a 76 |
| Se escanea un ISBN que no está en el catálogo | Un aviso "El libro con ISBN ... no está en el catálogo. Podés escanear otro." La cámara sigue funcionando | `src/app/escanear.tsx`, líneas 57 a 62 |
| La cámara está bloqueada | "La cámara está bloqueada para esta app...", "Abrir Ajustes" y el campo para escribir el ISBN | `src/app/escanear.tsx`, líneas 97 a 105, y `src/lib/permisos.ts`, línea 13 |
| Las notificaciones están denegadas | En Mis reservas, "Notificaciones bloqueadas: los recordatorios y avisos te van a aparecer acá" con "Abrir Ajustes". Los recordatorios llegan como avisos dentro de la app | `src/components/EstadoNotificaciones.tsx` y `src/context/BibliotecaContext.tsx`, líneas 252 a 256 y 281 a 289 |
| Se intenta reservar un libro ya reservado | En el detalle, el botón "Reservar" aparece desactivado con "Ya tenés este libro prestado" o la posición en la lista. Si se entra al modal por link: "Ya reservaste este libro" y "Ver mis reservas" | `src/lib/biblioteca.ts` (`decidirReserva`), `src/app/(tabs)/(catalogo)/libro/[isbn].tsx`, líneas 95 y 122, y `src/app/reservar/[isbn].tsx`, línea 75 |
| "Entregar al siguiente" con la lista de espera vacía | El libro desaparece del mostrador cuando se vacía su lista. Si no queda ninguno: "No hay libros con lista de espera en este momento." Si igual se llega a llamar, el mensaje es "Ese libro ya no tiene personas esperando." | `src/context/BibliotecaContext.tsx`, línea 264, y `src/app/mostrador.tsx`, líneas 37 y 41 |
| Login con clave incorrecta | "El usuario o la clave no son correctos. Revisalos y probá de nuevo." El login queda abierto | `src/app/login.tsx`, línea 39 |

### E4. Decisiones con argumentos

a) Identificador: elegí el ISBN como parámetro de ruta y como `key`.

- Es el dato que trae el código de barras. El escáner abre el detalle sin tener que traducir nada.
- La URL `/libro/9789872601812` se entiende y se puede compartir.
- Dos ediciones del mismo título tienen ISBN distinto. Para una biblioteca eso está bien, porque son libros distintos en el estante.
- `useLocalSearchParams` siempre devuelve texto. Con un id numérico tendría que convertirlo con `Number()`, controlar `NaN` y cuidar que no se pierdan ceros. El ISBN lo trato como texto de punta a punta, y lo valido con una expresión regular de 13 dígitos.
- El punto débil son los libros sin ISBN, como apuntes o ediciones viejas. Para esos casos la biblioteca tendría que asignar un código propio de 13 dígitos, como hacen muchas bibliotecas con etiquetas internas.

b) Estructuras: usé las clases `Pila` y `Cola` con `#items`.

- Lo que me dio la clase: nadie puede tocar los elementos desde afuera, y las reglas quedan dentro de la clase. Por ejemplo, la `Cola` desencola con un índice de inicio en lugar de `shift()`. Además se prueban solas con tests.
- Lo que me complicó: React necesita datos que no se modifiquen, y la clase está hecha para modificarse. Tuve que crear una copia en cada cambio (`new Cola(cola.aArray())`), si no aparece el error de B3.
- También me complicó el guardado. `JSON.stringify` de un objeto con campos `#` devuelve `{}`, así que para AsyncStorage tuve que convertir todo con `aArray()` y reconstruirlo al cargar (`colasAListas` y `colasDesdeListas` en `src/lib/biblioteca.ts`).
- Con un array y `[...pila, x]` todo eso sería directo, pero las reglas de la estructura quedarían repartidas por el código.

c) Memorización.

Un lugar donde aporta es el `value` del Context, con `useMemo` (`src/context/BibliotecaContext.tsx`, línea 309). Sin él, cada render del provider crearía un objeto nuevo, y todos los componentes que usan `useBiblioteca()` se volverían a renderizar aunque nada haya cambiado. Las funciones del Context están en `useCallback` para que el `useMemo` no cambie en cada render.

Un lugar donde sería ruido es `reintentar` en `useLibros`, que está en `useCallback`. Solo lo usa un botón que no está memorizado, así que el botón se dibuja igual en cada render. Además el proyecto tiene React Compiler activo (`"reactCompiler": true` en `app.json`), que memoriza automáticamente gran parte de esto. Varios `useCallback` míos son redundantes con el compilador.

Para comprobarlo en lugar de suponerlo usaría el Profiler de React DevTools, que se abre con `j` en la terminal de Expo. Graba una interacción, como activar un recordatorio, y muestra qué componentes se renderizaron y cuánto tardaron. Lo compararía con y sin el `useMemo`.

d) Datos duplicados: los ejemplares disponibles los calculo, no los guardo. `calcularDisponibles` (`src/lib/biblioteca.ts`, línea 6) resta los préstamos del estante a los ejemplares del libro.

Si el dato viviera en dos lugares, por ejemplo un contador de disponibles además de la lista de préstamos, cualquier operación que actualice uno y se olvide del otro los deja distintos. Por ejemplo, devolver un libro y no sumar el ejemplar. El detalle mostraría "0 disponibles" mientras la reserva cree que hay uno, o al revés. Es el tipo de error que aparece después de una secuencia de acciones y cuesta encontrar.

Con mi diseño hay una sola fuente de verdad, los préstamos. Los disponibles siempre salen de ella, así que no pueden contradecirse.
