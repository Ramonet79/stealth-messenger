
import React, { useState } from 'react';
import { ArrowLeft, UserRound } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface NewChatProps {
  onCreateChat: (username: string, name: string) => void;
  onCancel: () => void;
  onBack?: () => void; // Añadimos esta prop para mantener compatibilidad
}

const NewChat: React.FC<NewChatProps> = ({ onCreateChat, onCancel, onBack }) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState(1);
  const { t } = useLanguage();

  // Esta función utiliza onCancel o onBack, lo que esté disponible
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      onCancel();
    }
  };

  const handleSubmitUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setStep(2);
    }
  };

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateChat(username, name);
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
          <h2 className="font-medium">{t('new_message')}</h2>
        </div>
      </div>

      <div className="flex-1 p-6">
        {step === 1 ? (
          <form onSubmit={handleSubmitUsername} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('username')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('username_placeholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-messenger-primary focus:border-transparent"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                {t('enter_username_description')}
              </p>
            </div>
            <Button 
              type="submit"
              className="w-full bg-messenger-primary hover:bg-messenger-secondary"
              disabled={!username.trim()}
            >
              {t('continue')}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmitName} className="space-y-6">
            <div className="flex items-center justify-center mb-8">
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                <UserRound size={40} className="text-gray-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('contact_name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('name_placeholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-messenger-primary focus:border-transparent"
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                type="button"
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1"
              >
                {t('back')}
              </Button>
              <Button 
                type="submit"
                className="flex-1 bg-messenger-primary hover:bg-messenger-secondary"
                disabled={!name.trim()}
              >
                {t('save')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewChat;
