
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

export async function requestMediaPermissions() {
  if (!Capacitor.isNativePlatform()) return;

  const info = await Device.getInfo();
  const isAndroid = info.platform === 'android';

  if (isAndroid && typeof navigator !== 'undefined' && navigator.permissions) {
    try {
      const camera = await navigator.permissions.query({ name: 'camera' as any });
      const mic = await navigator.permissions.query({ name: 'microphone' as any });
      console.log('Permisos cámara:', camera.state);
      console.log('Permisos micrófono:', mic.state);
    } catch (err) {
      console.warn('Error al consultar permisos:', err);
    }
  }

  try {
    const perms = await Promise.all([
      navigator.mediaDevices.getUserMedia({ video: true }),
      navigator.mediaDevices.getUserMedia({ audio: true }),
    ]);
    console.log('Permisos concedidos:', perms);
  } catch (error) {
    console.warn('Permisos denegados:', error);
  }
}
