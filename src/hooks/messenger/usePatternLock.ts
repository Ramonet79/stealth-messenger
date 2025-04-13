
import { useState } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { patternService } from '@/services/patternService';
import { useToast } from '@/hooks/use-toast';

export const usePatternLock = () => {
  const [showPatternLock, setShowPatternLock] = useState<boolean>(false);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  const handlePatternComplete = async (contactId: string, pattern: number[]): Promise<boolean> => {
    if (!user || !contactId) return false;
    
    try {
      const isValid = await patternService.verifyContactPattern(user.id, contactId, pattern);
      
      if (isValid) {
        setShowPatternLock(false);
        
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Patrón incorrecto",
          description: "El patrón introducido no es válido",
        });
        return false;
      }
    } catch (error) {
      console.error("Error verifying pattern:", error);
      return false;
    }
  };

  const handleSaveContactPattern = async (contactId: string, pattern: number[], enabled: boolean): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await patternService.saveContactPattern(user.id, contactId, pattern, enabled);
      
      if (error) {
        console.error("Error saving contact pattern:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error saving contact pattern:", error);
      return false;
    }
  };

  return {
    showPatternLock,
    setShowPatternLock,
    handlePatternComplete,
    handleSaveContactPattern
  };
};
