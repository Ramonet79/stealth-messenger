
import { supabase } from '@/integrations/supabase/client';

export interface PatternData {
  id?: string;
  user_id: string;
  pattern: string;
}

export const patternService = {
  // Guardar o actualizar un patrón de desbloqueo
  savePattern: async (userId: string, pattern: number[]): Promise<{data: any, error: any}> => {
    // Convertir el array de números a string
    const patternStr = pattern.join(',');
    
    // Verificar si ya existe un patrón para este usuario
    const { data: existingPattern } = await supabase
      .from('unlock_patterns')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (existingPattern) {
      // Actualizar el patrón existente
      const { data, error } = await supabase
        .from('unlock_patterns')
        .update({ pattern: patternStr, updated_at: new Date() })
        .eq('user_id', userId);
      
      return { data, error };
    } else {
      // Crear un nuevo patrón
      const { data, error } = await supabase
        .from('unlock_patterns')
        .insert([
          { user_id: userId, pattern: patternStr },
        ]);
      
      return { data, error };
    }
  },
  
  // Obtener el patrón de un usuario
  getPattern: async (userId: string): Promise<{data: number[] | null, error: any}> => {
    const { data, error } = await supabase
      .from('unlock_patterns')
      .select('pattern')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return { data: null, error: error || new Error('No pattern found') };
    }
    
    // Convertir el string a array de números
    const patternArray = data.pattern.split(',').map(Number);
    return { data: patternArray, error: null };
  },
  
  // Verificar si un patrón coincide con el almacenado
  verifyPattern: async (userId: string, inputPattern: number[]): Promise<boolean> => {
    const { data: storedPattern, error } = await patternService.getPattern(userId);
    
    if (error || !storedPattern) {
      console.error('Error verificando patrón:', error);
      return false;
    }
    
    // Comparar los patrones
    if (storedPattern.length !== inputPattern.length) {
      return false;
    }
    
    return storedPattern.every((val, idx) => val === inputPattern[idx]);
  },

  // Para usuarios sin autenticación, verificamos contra el patrón hardcoded
  verifyDefaultPattern: (inputPattern: number[]): boolean => {
    const DEFAULT_PATTERN = [1, 5, 9, 6];
    
    if (DEFAULT_PATTERN.length !== inputPattern.length) {
      return false;
    }
    
    return DEFAULT_PATTERN.every((val, idx) => val === inputPattern[idx]);
  }
};
