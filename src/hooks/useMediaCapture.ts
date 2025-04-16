
// Web implementation fallback
export const useMediaCapture = () => {
  // Corregido: No debe tener parámetros para mantener la consistencia
  const startCapture = async () => {
    try {
      console.log('Starting media capture on web platform');
      alert('This feature is designed for native mobile platforms. Some capabilities may be limited on web.');
      // For web, you could implement using the browser's media APIs
      return null;
    } catch (error) {
      console.error('Error starting capture:', error);
      return null;
    }
  };

  return {
    startCapture
  };
};

export default useMediaCapture;
