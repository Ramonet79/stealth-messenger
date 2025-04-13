
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
    
    try {
      // Verificar si el usuario existe en la tabla profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', username)
        .single();
      
      if (error) {
        console.error("Error al verificar usuario:", error);
        setUsernameError(t('username_not_found') || 'Usuario no encontrado');
        setLoading(false);
        return false;
      }
      
      if (data) {
        setLoading(false);
        return true;
      } else {
        setUsernameError(t('username_not_found') || 'Usuario no encontrado');
        setLoading(false);
        return false;
      }
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
          <h2 className="font-medium">{t('new_message')}</h2>
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
              {t('username')} <span className="text-gray-500 text-xs">(proporcionado por tu contacto dScrt)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError('');
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
