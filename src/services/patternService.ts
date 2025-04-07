
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
    console.log("savePattern called with userId:", userId, "pattern:", pattern);
    
    if (!userId) {
      console.error("savePattern: UserId es requerido");
      return { data: null, error: new Error("UserId es requerido") };
    }
    
    if (!pattern || pattern.length < 4) {
      console.error("savePattern: Patrón inválido, debe tener al menos 4 puntos");
      return { data: null, error: new Error("Patrón inválido") };
    }
    
    // Convertir el array de números a string
    const patternStr = pattern.join(',');
    console.log(`Guardando patrón para usuario ${userId}: ${patternStr}`);
    
    try {
      // Verificar si ya existe un patrón para este usuario
      const { data: existingPattern, error: checkError } = await supabase
        .from('unlock_patterns')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error al verificar patrón existente:", checkError);
        return { data: null, error: checkError };
      }
      
      if (existingPattern) {
        console.log("Actualizando patrón existente");
        // Actualizar el patrón existente
        const { data, error } = await supabase
          .from('unlock_patterns')
          .update({ pattern: patternStr, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .select();
        
        if (error) {
          console.error("Error al actualizar patrón:", error);
        } else {
          console.log("Patrón actualizado correctamente:", data);
        }
        
        return { data, error };
      } else {
        console.log("Creando nuevo patrón");
        // Crear un nuevo patrón
        const { data, error } = await supabase
          .from('unlock_patterns')
          .insert([
            { user_id: userId, pattern: patternStr },
          ])
          .select();
        
        if (error) {
          console.error("Error al insertar nuevo patrón:", error);
        } else {
          console.log("Nuevo patrón creado correctamente:", data);
        }
        
        return { data, error };
      }
    } catch (error) {
      console.error("Error inesperado al guardar patrón:", error);
      return { data: null, error };
    }
  },
  
  // Obtener el patrón de un usuario
  getPattern: async (userId: string): Promise<{data: number[] | null, error: any}> => {
    console.log(`🔑 getPattern called for userId: ${userId}`);
    
    if (!userId) {
      console.error("getPattern: UserId es requerido");
      return { data: null, error: new Error("UserId es requerido") };
    }
    
    try {
      const { data, error } = await supabase
        .from('unlock_patterns')
        .select('pattern')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error al obtener patrón:", error);
        return { data: null, error };
      }
      
      if (!data) {
        console.log("🔑 No se encontró patrón para el usuario, usando patrón por defecto");
        return { data: null, error: new Error('No pattern found') };
      }
      
      // Convertir el string a array de números
      const patternArray = data.pattern.split(',').map(Number);
      console.log(`🔑 Patrón recuperado: ${patternArray.join(',')}`);
      return { data: patternArray, error: null };
    } catch (error) {
      console.error("Error inesperado al obtener patrón:", error);
      return { data: null, error };
    }
  },
  
  // Verificar si un patrón coincide con el almacenado
  verifyPattern: async (userId: string, inputPattern: number[]): Promise<boolean> => {
    console.log(`🔑 verifyPattern called for userId: ${userId}, inputPattern: ${inputPattern.join(',')}`);
    
    if (!userId || !inputPattern || inputPattern.length < 4) {
      console.error("verifyPattern: Parámetros inválidos");
      return false;
    }
    
    try {
      const { data: storedPattern, error } = await patternService.getPattern(userId);
      
      if (error || !storedPattern) {
        console.error('Error verificando patrón:', error);
        console.log("🔑 Fallback to default pattern verification");
        const isDefaultMatch = patternService.verifyDefaultPattern(inputPattern);
        console.log("🔑 Default pattern verification result:", isDefaultMatch);
        return isDefaultMatch;
      }
      
      // Comparar los patrones
      if (storedPattern.length !== inputPattern.length) {
        console.log(`🔑 Longitud de patrones diferente. Stored: ${storedPattern.length}, Input: ${inputPattern.length}`);
        return false;
      }
      
      const matches = storedPattern.every((val, idx) => val === inputPattern[idx]);
      console.log(`🔑 Patrones coinciden: ${matches}. Stored: [${storedPattern}], Input: [${inputPattern}]`);
      return matches;
    } catch (error) {
      console.error("Error inesperado al verificar patrón:", error);
      const isDefaultMatch = patternService.verifyDefaultPattern(inputPattern);
      console.log("🔑 Fallback to default pattern after error:", isDefaultMatch);
      return isDefaultMatch;
    }
  },

  // Para usuarios sin autenticación, verificamos contra el patrón hardcoded
  verifyDefaultPattern: (inputPattern: number[]): boolean => {
    console.log("🔑 verifyDefaultPattern called with:", inputPattern);
    const DEFAULT_PATTERN = [1, 5, 9, 6];
    
    if (DEFAULT_PATTERN.length !== inputPattern.length) {
      console.log(`🔑 Longitud de patrones diferente. Default: ${DEFAULT_PATTERN.length}, Input: ${inputPattern.length}`);
      return false;
    }
    
    const matches = DEFAULT_PATTERN.every((val, idx) => val === inputPattern[idx]);
    console.log(`🔑 Patrones coinciden con default: ${matches}`);
    return matches;
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
