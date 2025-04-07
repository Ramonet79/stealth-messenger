import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calculator from '@/components/Calculator';
import PatternLock from '@/components/PatternLock';
import MessengerApp from '@/components/Messenger/MessengerApp';
import ThemeSelector from '@/components/ThemeSelector';
import { toast } from '@/components/ui/use-toast';
import { useToast } from '@/hooks/use-toast';
import type { AppTheme } from '@/components/ThemeSelector';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { patternService } from '@/services/patternService';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PatternCreation } from '@/components/auth/PatternCreation';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPatternLock, setShowPatternLock] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(true);
  const [appTheme, setAppTheme] = useState<AppTheme>('calculator');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [language, setLanguage] = useState<string>('es-ES'); // Default language
  const [logoAura, setLogoAura] = useState<'none' | 'green' | 'red'>('none');
  const [showLogoChangeAlert, setShowLogoChangeAlert] = useState(false);
  const [showPatternInstructions, setShowPatternInstructions] = useState(false);
  const [isCreatingFirstPattern, setIsCreatingFirstPattern] = useState(false);
  const [newPattern, setNewPattern] = useState<number[]>([]);
  const [patternStep, setPatternStep] = useState(1);
  
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const systemLanguage = navigator.language;
    const supportedLanguages = [
      'es-ES', 'en-US', 'en-GB', 'fr', 'it', 'de', 
      'es-419', 'es-MX', 'nl', 'fi', 'ar', 'zh', 'hi'
    ];
    
    if (supportedLanguages.includes(systemLanguage)) {
      setLanguage(systemLanguage);
    } else {
      setLanguage('en-US');
    }
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
      setLogoAura('none');
    } else {
      setLogoAura(hasUnreadMessages ? 'red' : 'green');
    }
  }, [isAuthenticated, hasUnreadMessages]);
  
  useEffect(() => {
    const handleUnreadMessages = (event: CustomEvent) => {
      setHasUnreadMessages(event.detail.hasUnreadMessages);
    };
    
    const handleUnreadRequests = (event: CustomEvent) => {
      if (event.detail.hasUnreadRequests) {
        setHasUnreadMessages(true);
      }
    };
    
    window.addEventListener('unreadMessagesUpdate', handleUnreadMessages as EventListener);
    window.addEventListener('unreadRequestsUpdate', handleUnreadRequests as EventListener);
    
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setHasUnreadMessages(true);
      }, 30000);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('unreadMessagesUpdate', handleUnreadMessages as EventListener);
        window.removeEventListener('unreadRequestsUpdate', handleUnreadRequests as EventListener);
      };
    }
    
    return () => {
      window.removeEventListener('unreadMessagesUpdate', handleUnreadMessages as EventListener);
      window.removeEventListener('unreadRequestsUpdate', handleUnreadRequests as EventListener);
    };
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (user) {
      const isFirstLogin = sessionStorage.getItem('firstLogin') === 'true';
      
      if (isFirstLogin) {
        console.log("Primera sesión detectada en Index, iniciando creación de patrón");
        setIsCreatingFirstPattern(true);
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(false);
      }
      
      const isFirstTimeAfterConfirmation = sessionStorage.getItem('firstLoginAfterConfirmation') === 'true';
      
      if (isFirstTimeAfterConfirmation) {
        setShowLogoChangeAlert(true);
        setShowPatternInstructions(true);
        sessionStorage.removeItem('firstLoginAfterConfirmation');
        
        toast({
          title: "Logo cambiado",
          description: "El logo de la aplicación ha cambiado a modo camuflaje",
        });
      }
    } else if (!showPatternLock) {
      console.log("No hay usuario autenticado, mostrando aplicación de camuflaje");
    }
  }, [user, showPatternLock]);
  
  const handleSettingsClick = () => {
    setShowPatternLock(true);
  };
  
  const handlePatternComplete = async (pattern: number[]): Promise<boolean> => {
    let isCorrect = false;
    
    if (user) {
      try {
        isCorrect = await patternService.verifyPattern(user.id, pattern);
      } catch (error) {
        console.error("Error al verificar patrón:", error);
        isCorrect = patternService.verifyDefaultPattern(pattern);
      }
    } else {
      isCorrect = patternService.verifyDefaultPattern(pattern);
    }
    
    if (isCorrect) {
      setShowPatternLock(false);
      setIsAuthenticated(true);
      setHasUnreadMessages(false);
      return true;
    } else {
      return false;
    }
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
  };
  
  const handleSelectTheme = (theme: AppTheme) => {
    setAppTheme(theme);
    setShowThemeSelector(false);
    
    toast({
      title: "Tema cambiado",
      description: `El tema se ha cambiado a ${theme}. El logo de la app ahora refleja este tema.`,
    });
  };
  
  const dismissLogoAlert = () => {
    setShowLogoChangeAlert(false);
  };
  
  const dismissPatternInstructions = () => {
    setShowPatternInstructions(false);
  };
  
  const handleCompletePatternCreation = async () => {
    sessionStorage.removeItem('firstLogin');
    sessionStorage.removeItem('firstLoginAfterConfirmation');
    
    setShowPatternInstructions(true);
    
    setIsCreatingFirstPattern(false);
    setIsAuthenticated(false);
    
    toast({
      title: "Patrón creado correctamente",
      description: "Para acceder al chat dScrt, pulsa el icono de configuración y usa tu patrón",
    });
  };
  
  const renderCamouflageApp = () => {
    switch (appTheme) {
      case 'calculator':
        return <Calculator onSettingsClick={handleSettingsClick} hasUnreadMessages={hasUnreadMessages} logoAura={logoAura} />;
      case 'weather':
        return <WeatherApp onSettingsClick={handleSettingsClick} hasUnreadMessages={hasUnreadMessages} logoAura={logoAura} />;
      case 'radar':
        return <RadarApp onSettingsClick={handleSettingsClick} hasUnreadMessages={hasUnreadMessages} logoAura={logoAura} />;
      case 'browser':
        return <BrowserApp onSettingsClick={handleSettingsClick} hasUnreadMessages={hasUnreadMessages} logoAura={logoAura} />;
      case 'notes':
        return <NotesApp onSettingsClick={handleSettingsClick} hasUnreadMessages={hasUnreadMessages} logoAura={logoAura} />;
      case 'fitness':
        return <FitnessApp onSettingsClick={handleSettingsClick} hasUnreadMessages={hasUnreadMessages} logoAura={logoAura} />;
      case 'scanner':
        return <ScannerApp onSettingsClick={handleSettingsClick} hasUnreadMessages={hasUnreadMessages} logoAura={logoAura} />;
      case 'converter':
        return <ConverterApp onSettingsClick={handleSettingsClick} hasUnreadMessages={hasUnreadMessages} logoAura={logoAura} />;
      case 'flashlight':
        return <FlashlightApp onSettingsClick={handleSettingsClick} hasUnreadMessages={hasUnreadMessages} logoAura={logoAura} />;
      case 'calendar':
        return <CalendarApp onSettingsClick={handleSettingsClick} hasUnreadMessages={hasUnreadMessages} logoAura={logoAura} />;
      default:
        return <Calculator onSettingsClick={handleSettingsClick} hasUnreadMessages={hasUnreadMessages} logoAura={logoAura} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated ? (
        <>
          <MessengerApp 
            onLogout={handleLogout} 
            onUnreadMessagesChange={setHasUnreadMessages}
          />
          
          <div className="fixed bottom-4 right-4">
            <button 
              onClick={() => setShowThemeSelector(true)}
              className="p-3 bg-messenger-primary text-white rounded-full shadow-lg hover:bg-messenger-secondary transition-colors"
            >
              Tema
            </button>
          </div>
        </>
      ) : isCreatingFirstPattern && user ? (
        <PatternCreation 
          userId={user.id}
          step={patternStep}
          setStep={setPatternStep}
          newPattern={newPattern}
          setNewPattern={setNewPattern}
          onComplete={handleCompletePatternCreation}
        />
      ) : (
        <div className="flex-1 relative">
          {renderCamouflageApp()}
          
          {showLogoChangeAlert && (
            <div className="fixed inset-x-0 top-0 p-4 z-50">
              <Alert className="max-w-md mx-auto shadow-lg">
                <AlertDescription className="flex justify-between items-center">
                  <span>El logo de la aplicación ha cambiado a modo camuflaje.</span>
                  <button 
                    onClick={() => setShowLogoChangeAlert(false)}
                    className="ml-2 text-sm font-medium underline"
                  >
                    Entendido
                  </button>
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {showPatternInstructions && (
            <div className="fixed inset-x-0 bottom-0 p-4 z-50">
              <Alert className="max-w-md mx-auto shadow-lg">
                <AlertDescription className="flex justify-between items-center">
                  <span>
                    Para acceder al chat dScrt, pulsa el icono de configuración (⚙️) y 
                    usa tu patrón de desbloqueo.
                  </span>
                  <button 
                    onClick={() => setShowPatternInstructions(false)}
                    className="ml-2 text-sm font-medium underline"
                  >
                    Entendido
                  </button>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      )}
      
      {showPatternLock && (
        <div className="fixed inset-0 bg-white z-10">
          <PatternLock onPatternComplete={handlePatternComplete} />
        </div>
      )}
      
      {showThemeSelector && (
        <ThemeSelector
          currentTheme={appTheme}
          onSelectTheme={handleSelectTheme}
          onClose={() => setShowThemeSelector(false)}
        />
      )}
    </div>
  );
};

export default Index;
