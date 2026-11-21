import { Stack } from 'expo-router';

import { LinkPersonal } from '../../../components/LinkPersonal';

export const unstable_settings = {
  anchor: 'index',
};

function botonPersonal() {
  return <LinkPersonal />;
}

export default function LayoutCatalogo() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Atrás' }}>
      <Stack.Screen name="index" options={{ title: 'Catálogo', headerRight: botonPersonal }} />
      <Stack.Screen name="libro/[isbn]" options={{ title: 'Libro' }} />
    </Stack>
  );
}
