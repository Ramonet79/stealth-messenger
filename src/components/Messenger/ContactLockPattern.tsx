
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import PatternLock from '@/components/PatternLock';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ContactLockPatternProps {
  contactId: string;
  contactName: string;
  onSavePattern: (contactId: string, pattern: number[], enabled: boolean) => Promise<boolean>;
  onBack: () => void;
  currentPattern?: number[];
  isEnabled?: boolean;
}

const ContactLockPattern: React.FC<ContactLockPatternProps> = ({
  contactId,
  contactName,
  onSavePattern,
  onBack,
  currentPattern,
  isEnabled = false,
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [newPattern, setNewPattern] = useState<number[]>([]);
  const [patternEnabled, setPatternEnabled] = useState(isEnabled);
  const [isEditingPattern, setIsEditingPattern] = useState(currentPattern ? false : true);

  useEffect(() => {
    setPatternEnabled(isEnabled);
  }, [isEnabled]);

  const handleToggleEnabled = (enabled: boolean) => {
    setPatternEnabled(enabled);
    
    if (currentPattern) {
      onSavePattern(contactId, currentPattern, enabled)
        .then((success) => {
          if (success) {
            toast({
              title: enabled 
                ? t('contactLock.enabled') || 'Patrón de desbloqueo activado'
                : t('contactLock.disabled') || 'Patrón de desbloqueo desactivado',
              description: enabled
                ? t('contactLock.needPatternDesc') || 'Ahora necesitarás introducir el patrón para acceder a este chat'
                : t('contactLock.noPatternDesc') || 'Ya no necesitarás introducir el patrón para acceder a este chat'
            });
          }
        });
    }
  };

  const handleStartEditingPattern = () => {
    setIsEditingPattern(true);
    setStep(1);
    setNewPattern([]);
  };

  const handlePatternComplete = async (pattern: number[]): Promise<boolean> => {
    if (pattern.length < 4) {
      toast({
        variant: "destructive",
        title: t('contactLock.tooShort') || "Patrón demasiado corto",
        description: t('contactLock.needMinPoints') || "El patrón debe tener al menos 4 puntos",
      });
      return false;
    }
    
    if (step === 1) {
      setNewPattern(pattern);
      setStep(2);
      toast({
        title: t('contactLock.patternCreated') || 'Patrón registrado',
        description: t('contactLock.confirmPattern') || 'Por favor, confirma tu patrón',
      });
      return true;
    } else {
      // Compare patterns
      const patternsMatch = pattern.length === newPattern.length && 
        pattern.every((val, idx) => val === newPattern[idx]);
      
      if (patternsMatch) {
        const success = await onSavePattern(contactId, pattern, patternEnabled);
        
        if (success) {
          toast({
            title: t('contactLock.patternSaved') || 'Patrón guardado',
            description: t('contactLock.patternSavedDesc') || 'El patrón de desbloqueo ha sido guardado',
          });
          setIsEditingPattern(false);
          return true;
        } else {
          toast({
            variant: "destructive",
            title: t('contactLock.error') || 'Error',
            description: t('contactLock.errorSaving') || 'No se pudo guardar el patrón',
          });
          return false;
        }
      } else {
        toast({
          variant: "destructive",
          title: t('contactLock.mismatch') || 'Los patrones no coinciden',
          description: t('contactLock.tryAgain') || 'Por favor, intenta nuevamente',
        });
        setStep(1);
        return false;
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center p-4 bg-white border-b shadow-sm">
        <button
          onClick={onBack}
          className="mr-3 p-2 rounded-full hover:bg-gray-100"
          aria-label={t('back')}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-medium">
          {t('contactLock.title') || 'Patrón de desbloqueo para'} {contactName}
        </h1>
      </div>

      {isEditingPattern ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-xl font-medium mb-8">
            {step === 1 
              ? t('contactLock.create') || 'Crear patrón de desbloqueo'
              : t('contactLock.confirm') || 'Confirmar patrón'}
          </h2>
          <PatternLock onPatternComplete={handlePatternComplete} isCreationMode={true} />
          
          <p className="mt-8 text-sm text-gray-500 text-center max-w-xs">
            {t('contactLock.description') || 'Este patrón será requerido para acceder a las conversaciones con este contacto'}
          </p>
        </div>
      ) : (
        <div className="flex-1 p-4">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">
                  {t('contactLock.requirePattern') || 'Requerir patrón de desbloqueo'}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('contactLock.toggleDesc') || 'Activa esta opción para proteger este chat con un patrón'}
                </p>
              </div>
              <Switch 
                checked={patternEnabled}
                onCheckedChange={handleToggleEnabled}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-2">
              {t('contactLock.changePattern') || 'Cambiar patrón de desbloqueo'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('contactLock.changeDesc') || 'Puedes cambiar el patrón de desbloqueo para este contacto en cualquier momento'}
            </p>
            <button
              onClick={handleStartEditingPattern}
              className="w-full py-2 px-4 bg-messenger-primary text-white rounded-md hover:bg-messenger-secondary transition-colors"
            >
              {t('contactLock.edit') || 'Editar patrón'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactLockPattern;
