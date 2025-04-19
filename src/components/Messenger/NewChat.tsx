
import React, { useState } from 'react';
import { ArrowLeft, UserRound, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewChatProps {
  onCreateChat: (username: string, name: string) => void;
  onCancel: () => void;
  onBack?: () => void;
}

const NewChat: React.FC<NewChatProps> = ({ onCreateChat, onCancel, onBack }) => {
  const [username, setUsername] = useState('');
  const [alias, setAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuggestion, setUsernameSuggestion] = useState<string | null>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  // Esta función utiliza onCancel o onBack, lo que esté disponible
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      onCancel();
    }
  };

  const checkUsernameExists = async (username: string) => {
    if (!username.trim()) return false;

    setLoading(true);
    setUsernameError('');
    setUsernameSuggestion(null);
    
    try {
      console.log("Verificando usuario:", username);
      
      // Primero intentamos una búsqueda exacta
      const { data: exactMatch, error: exactError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', username)
        .limit(1);
      
      if (exactError) {
        console.error("Error al verificar usuario (búsqueda exacta):", exactError);
        setUsernameError(t('username_not_found') || 'Usuario no encontrado');
        setLoading(false);
        return false;
      }
      
      if (exactMatch && exactMatch.length > 0) {
        console.log("Usuario encontrado (búsqueda exacta):", exactMatch);
        setLoading(false);
        return true;
      }
      
      // Si no hay coincidencia exacta, intentamos con búsqueda case-insensitive
      const { data: caseInsensitiveMatch, error: insensitiveError } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', username)
        .limit(1);
      
      if (insensitiveError) {
        console.error("Error al verificar usuario (búsqueda case-insensitive):", insensitiveError);
        setUsernameError(t('username_not_found') || 'Usuario no encontrado');
        setLoading(false);
        return false;
      }
      
      if (caseInsensitiveMatch && caseInsensitiveMatch.length > 0) {
        console.log("Usuario encontrado (búsqueda case-insensitive):", caseInsensitiveMatch);
        // Mostrar sugerencia con el nombre de usuario exacto (diferencia de mayúsculas/minúsculas)
        if (caseInsensitiveMatch[0].username !== username) {
          setUsernameSuggestion(caseInsensitiveMatch[0].username);
        }
        // Actualizamos el username con el valor exacto de la base de datos para evitar problemas de case
        setUsername(caseInsensitiveMatch[0].username);
        setLoading(false);
        return true;
      }
      
      // Último intento: buscar usando "contains" para usuarios con parte del nombre
      const { data: containsMatch, error: containsError } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', `%${username}%`)
        .limit(5);
        
      if (!containsError && containsMatch && containsMatch.length > 0) {
        console.log("Usuarios similares encontrados:", containsMatch);
        // Mostrar el primer resultado como sugerencia
        setUsernameSuggestion(containsMatch[0].username);
        setUsernameError(`No se encontró "${username}". ¿Querías decir "${containsMatch[0].username}"?`);
        setLoading(false);
        return false;
      }
      
      console.log("Usuario no encontrado tras todas las búsquedas");
      setUsernameError(t('username_not_found') || 'Usuario no encontrado');
      setLoading(false);
      return false;
    } catch (error) {
      console.error("Error inesperado:", error);
      setUsernameError(t('error_checking_username') || 'Error al verificar el usuario');
      setLoading(false);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !alias.trim()) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Por favor, completa todos los campos",
      });
      return;
    }
    
    const userExists = await checkUsernameExists(username);
    if (!userExists) {
      toast({
        variant: "destructive",
        title: "Usuario no encontrado",
        description: "El nombre de usuario no existe en el sistema",
      });
      return;
    }
    
    onCreateChat(username, alias);
  };

  const useSuggestion = () => {
    if (usernameSuggestion) {
      setUsername(usernameSuggestion);
      setUsernameSuggestion(null);
      setUsernameError('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-messenger-background">
      <div className="flex items-center p-4 border-b bg-white">
        <button
          onClick={handleBack}
          className="mr-3 p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="font-medium">{t('new_message') || "Nuevo mensaje"}</h2>
        </div>
      </div>

      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-center mb-8">
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
              <UserRound size={40} className="text-gray-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('username') || "Nombre de usuario"} <span className="text-gray-500 text-xs">(proporcionado por tu contacto dScrt)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError('');
                  setUsernameSuggestion(null);
                }}
                placeholder={t('username_placeholder') || "@usuario"}
                className={`w-full px-4 py-2 border ${usernameError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-messenger-primary focus:border-transparent`}
                required
              />
              {usernameError && (
                <div className="flex items-center text-red-500 text-xs mt-1">
                  <AlertCircle size={12} className="mr-1" />
                  {usernameError}
                </div>
              )}
              {usernameSuggestion && (
                <div className="mt-1">
                  <button 
                    type="button" 
                    className="text-messenger-primary text-sm hover:underline"
                    onClick={useSuggestion}
                  >
                    Usar "{usernameSuggestion}"
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('contact_alias') || 'Alias del contacto'}
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder={t('alias_placeholder') || "¿Cómo quieres llamar a este contacto?"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-messenger-primary focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500">
              {t('alias_description') || "Este nombre será visible solo para ti en tus conversaciones"}
            </p>
          </div>
          
          <Button 
            type="submit"
            className="w-full bg-messenger-primary hover:bg-messenger-secondary"
            disabled={loading || !username.trim() || !alias.trim()}
          >
            {loading ? t('checking') || "Verificando..." : t('save') || "Guardar"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NewChat;
