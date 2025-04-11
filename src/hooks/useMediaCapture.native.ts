import { MediaCapture, MediaFile } from '@capacitor-community/media-capture';
import { Permissions } from '@capacitor/core';

export const useMediaCapture = () => {
  const requestPermissions = async () => {
    const result = await Permissions.requestPermissions([
      'camera',
      'microphone',
    ]);
    return result;
  };

  const captureAudio = async () => {
    await requestPermissions();
    const audioFile: MediaFile[] = await MediaCapture.captureAudio();
    return audioFile;
  };

  const captureVideo = async () => {
    await requestPermissions();
    const videoFile: MediaFile[] = await MediaCapture.captureVideo();
    return videoFile;
  };

  return {
    captureAudio,
    captureVideo,
  };
};
