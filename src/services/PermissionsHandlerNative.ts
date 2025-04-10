
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

// Define a function to check if we're on a native platform
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

// Function to check camera permissions
export const checkCameraPermissions = async (): Promise<boolean> => {
  try {
    if (!isNativePlatform()) {
      console.log('Not on native platform, assuming we have permissions');
      return true;
    }

    const perms = await Camera.checkPermissions();
    console.log('Camera permissions status:', perms);
    
    return perms.camera === 'granted';
  } catch (e) {
    console.error('Error checking camera permissions:', e);
    return false;
  }
};

// Function to request camera permissions
export const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    if (!isNativePlatform()) {
      console.log('Not on native platform, assuming we have permissions');
      return true;
    }

    const perms = await Camera.requestPermissions();
    console.log('Camera permissions after request:', perms);
    
    return perms.camera === 'granted';
  } catch (e) {
    console.error('Error requesting camera permissions:', e);
    return false;
  }
};

// Function to capture an image
export const captureImage = async () => {
  try {
    console.log('Starting image capture with Camera.getPhoto');
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      promptLabelHeader: 'Camera',
      promptLabelCancel: 'Cancel',
      promptLabelPhoto: 'Library',
      promptLabelPicture: 'Take photo'
    });
    
    console.log('Image captured successfully');
    return {
      dataUrl: image.dataUrl,
      success: true
    };
  } catch (e) {
    console.error('Error capturing image:', e);
    return {
      dataUrl: null,
      success: false,
      error: e
    };
  }
};

// Function to take a picture (alias of captureImage for compatibility)
export const takePicture = async (): Promise<string | null> => {
  try {
    const result = await captureImage();
    if (result.success && result.dataUrl) {
      return result.dataUrl;
    }
    return null;
  } catch (e) {
    console.error('Error in takePicture:', e);
    return null;
  }
};

// Function to check microphone permissions
export const checkMicrophonePermissions = async (): Promise<boolean> => {
  try {
    if (!isNativePlatform()) {
      // For web, we need to request permissions differently
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          return true;
        }
      } catch (e) {
        console.error('Error checking microphone permissions:', e);
        return false;
      }
    }
    
    // For native platforms, we just check if we have camera permissions for now
    return await checkCameraPermissions();
  } catch (e) {
    console.error('Error checking microphone permissions:', e);
    return false;
  }
};

// Function to request microphone permissions
export const requestMicrophonePermissions = async (): Promise<boolean> => {
  try {
    if (!isNativePlatform()) {
      // For web, we need to request permissions differently
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          return true;
        }
      } catch (e) {
        console.error('Error requesting microphone permissions:', e);
        return false;
      }
    }
    
    // For native platforms, we just request camera permissions for now
    return await requestCameraPermissions();
  } catch (e) {
    console.error('Error requesting microphone permissions:', e);
    return false;
  }
};
