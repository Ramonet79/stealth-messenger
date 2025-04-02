
import { supabase } from '@/integrations/supabase/client';

export interface PatternData {
  id?: string;
  user_id: string;
  pattern: string;
}

export interface ContactPatternData {
  id?: string;
  user_id: string;
  contact_id: string;
  pattern: string;
  is_enabled: boolean;
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
        .update({ pattern: patternStr, updated_at: new Date().toISOString() })
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
  },

  // Nuevas funciones para patrones de contactos
  
  // Guardar o actualizar un patrón de desbloqueo para un contacto
  saveContactPattern: async (userId: string, contactId: string, pattern: number[], isEnabled: boolean): Promise<{data: any, error: any}> => {
    // Convertir el array de números a string
    const patternStr = pattern.join(',');
    
    // Verificar si ya existe un patrón para este contacto
    const { data: existingPattern, error: fetchError } = await supabase
      .from('contact_unlock_patterns')
      .select('*')
      .eq('user_id', userId)
      .eq('contact_id', contactId)
      .maybeSingle();
    
    if (fetchError) {
      return { data: null, error: fetchError };
    }
    
    if (existingPattern) {
      // Actualizar el patrón existente
      const { data, error } = await supabase
        .from('contact_unlock_patterns')
        .update({ 
          pattern: patternStr, 
          is_enabled: isEnabled,
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('contact_id', contactId);
      
      return { data, error };
    } else {
      // Crear un nuevo patrón para el contacto
      const { data, error } = await supabase
        .from('contact_unlock_patterns')
        .insert([
          { 
            user_id: userId, 
            contact_id: contactId, 
            pattern: patternStr,
            is_enabled: isEnabled 
          }
        ]);
      
      return { data, error };
    }
  },
  
  // Obtener el patrón para un contacto específico
  getContactPattern: async (userId: string, contactId: string): Promise<{data: ContactPatternData | null, error: any}> => {
    const { data, error } = await supabase
      .from('contact_unlock_patterns')
      .select('*')
      .eq('user_id', userId)
      .eq('contact_id', contactId)
      .maybeSingle();
    
    if (error || !data) {
      return { data: null, error: error || new Error('No pattern found for contact') };
    }
    
    // Extraer los datos del patrón del contacto
    const contactPattern: ContactPatternData = {
      id: data.id,
      user_id: data.user_id,
      contact_id: data.contact_id,
      pattern: data.pattern,
      is_enabled: data.is_enabled
    };
    
    return { data: contactPattern, error: null };
  },
  
  // Verificar si un patrón coincide con el almacenado para un contacto
  verifyContactPattern: async (userId: string, contactId: string, inputPattern: number[]): Promise<boolean> => {
    const { data, error } = await patternService.getContactPattern(userId, contactId);
    
    if (error || !data) {
      console.error('Error verificando patrón de contacto:', error);
      return false;
    }
    
    // Si el patrón está desactivado, no verificamos
    if (!data.is_enabled) {
      return true;
    }
    
    // Convertir el string a array de números
    const storedPattern = data.pattern.split(',').map(Number);
    
    // Comparar los patrones
    if (storedPattern.length !== inputPattern.length) {
      return false;
    }
    
    return storedPattern.every((val, idx) => val === inputPattern[idx]);
  },
  
  // Verificar si un contacto tiene patrón de desbloqueo activo
  contactHasActivePattern: async (userId: string, contactId: string): Promise<boolean> => {
    const { data, error } = await patternService.getContactPattern(userId, contactId);
    
    if (error || !data) {
      return false;
    }
    
    return data.is_enabled;
  }
};
