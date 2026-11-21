import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { BibliotecaProvider } from '../context/BibliotecaContext';
import { configurarNotificaciones } from '../lib/notificaciones';

SplashScreen.preventAutoHideAsync();
configurarNotificaciones();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function LayoutRaiz() {
  const esquema = useColorScheme();

  return (
    <ThemeProvider value={esquema === 'dark' ? DarkTheme : DefaultTheme}>
      <BibliotecaProvider>
        {({ sesionIniciada }) => (
          <Stack screenOptions={{ headerBackTitle: 'Atrás' }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="buscar" options={{ title: 'Buscar' }} />
            <Stack.Screen name="escanear" options={{ title: 'Escanear' }} />
            <Stack.Screen
              name="reservar/[isbn]"
              options={{ presentation: 'modal', title: 'Confirmar reserva' }}
            />
            <Stack.Screen
              name="permisos/[recurso]"
              options={{ presentation: 'modal', title: 'Permiso' }}
            />
            <Stack.Screen name="+not-found" options={{ title: 'Página no encontrada' }} />
            <Stack.Protected guard={!sesionIniciada}>
              <Stack.Screen
                name="login"
                options={{ presentation: 'modal', title: 'Ingreso del personal' }}
              />
            </Stack.Protected>
            <Stack.Protected guard={sesionIniciada}>
              <Stack.Screen name="mostrador" options={{ title: 'Mostrador' }} />
            </Stack.Protected>
          </Stack>
        )}
      </BibliotecaProvider>
    </ThemeProvider>
  );
}
