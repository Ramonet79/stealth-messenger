
import React, { useState } from 'react';
import { ArrowLeft, Search, UserRound } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface NewChatProps {
  onCreateChat: (phone: string, name: string) => void;
  onCancel: () => void;
}

const NewChat: React.FC<NewChatProps> = ({ onCreateChat, onCancel }) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState(1);
  const { t } = useLanguage();

  const handleSubmitPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      setStep(2);
    }
  };

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateChat(phone, name);
    }
  };

  return (
    <div className="flex flex-col h-full bg-messenger-background">
      <div className="flex items-center p-4 border-b bg-white">
        <button
          onClick={onCancel}
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
          <form onSubmit={handleSubmitPhone} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('phone_number')}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('phone_placeholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-messenger-primary focus:border-transparent"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Introduce el número de teléfono completo con prefijo internacional
              </p>
            </div>
            <Button 
              type="submit"
              className="w-full bg-messenger-primary hover:bg-messenger-secondary"
              disabled={!phone.trim()}
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
