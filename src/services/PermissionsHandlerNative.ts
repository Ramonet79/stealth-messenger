
import { Camera, CameraResultType as CameraResultTypeEnum, CameraSource as CameraSourceEnum } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

// Define una función para verificar si estamos en una plataforma nativa
const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

// Función para verificar permisos de cámara
export const checkCameraPermissions = async (): Promise<boolean> => {
  try {
    if (!isNativePlatform()) {
      console.log('No estamos en plataforma nativa, asumiendo que tenemos permisos');
      return true;
    }

    const perms = await Camera.checkPermissions();
    console.log('Estado de permisos de cámara:', perms);
    
    return perms.camera === 'granted';
  } catch (e) {
    console.error('Error al verificar permisos de cámara:', e);
    return false;
  }
};

// Función para solicitar permisos de cámara
export const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    if (!isNativePlatform()) {
      console.log('No estamos en plataforma nativa, asumiendo que tenemos permisos');
      return true;
    }

    const perms = await Camera.requestPermissions();
    console.log('Permisos de cámara después de solicitud:', perms);
    
    return perms.camera === 'granted';
  } catch (e) {
    console.error('Error al solicitar permisos de cámara:', e);
    return false;
  }
};

// Función para capturar una imagen
export const captureImage = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultTypeEnum.DataUrl,
      source: CameraSourceEnum.Camera,
      promptLabelHeader: 'Cámara',
      promptLabelCancel: 'Cancelar',
      promptLabelPhoto: 'Biblioteca',
      promptLabelPicture: 'Tomar foto'
    });
    
    return {
      dataUrl: image.dataUrl,
      success: true
    };
  } catch (e) {
    console.error('Error al capturar imagen:', e);
    return {
      dataUrl: null,
      success: false,
      error: e
    };
  }
};
