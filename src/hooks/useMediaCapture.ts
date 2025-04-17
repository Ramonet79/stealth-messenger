
// Web implementation fallback
export const useMediaCapture = () => {
  const startCapture = async (type = 'media') => {
    try {
      console.log(`Starting media capture (${type}) on web platform`);
      
      if (type === 'media' || type === 'image' || type === 'video') {
        // Para web, implementamos un selector de archivo simple
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'image' ? 'image/*' : 'image/*,video/*';
        
        input.click();
        
        return new Promise((resolve) => {
          input.onchange = () => {
            if (input.files && input.files.length > 0) {
              resolve(input.files[0]);
            } else {
              resolve(null);
            }
          };
        });
      }
      
      alert('Esta función está diseñada para plataformas móviles nativas. Algunas capacidades pueden estar limitadas en web.');
      return null;
    } catch (error) {
      console.error(`Error starting ${type} capture:`, error);
      return null;
    }
  };

  return {
    startCapture
  };
};

export default useMediaCapture;
