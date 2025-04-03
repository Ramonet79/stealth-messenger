
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

// Componentes para cada tema
import WeatherApp from '@/components/ThemeApps/WeatherApp';
import RadarApp from '@/components/ThemeApps/RadarApp';
import BrowserApp from '@/components/ThemeApps/BrowserApp';
import NotesApp from '@/components/ThemeApps/NotesApp';
import FitnessApp from '@/components/ThemeApps/FitnessApp';
import ScannerApp from '@/components/ThemeApps/ScannerApp';
import ConverterApp from '@/components/ThemeApps/ConverterApp';
import FlashlightApp from '@/components/ThemeApps/FlashlightApp';
import CalendarApp from '@/components/ThemeApps/CalendarApp';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPatternLock, setShowPatternLock] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(true);
  const [appTheme, setAppTheme] = useState<AppTheme>('calculator');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [language, setLanguage] = useState<string>('es-ES'); // Default language
  // Nuevo estado para controlar la aureola
  const [logoAura, setLogoAura] = useState<'none' | 'green' | 'red'>('none');
  
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  
  // Detect system language on first load
  useEffect(() => {
    const systemLanguage = navigator.language;
    const supportedLanguages = [
      'es-ES', 'en-US', 'en-GB', 'fr', 'it', 'de', 
      'es-419', 'es-MX', 'nl', 'fi', 'ar', 'zh', 'hi'
    ];
    
    if (supportedLanguages.includes(systemLanguage)) {
      setLanguage(systemLanguage);
    } else {
      // If not supported, default to English (US)
      setLanguage('en-US');
    }
  }, []);
  
  // Actualizar la aureola según el estado de mensajes no leídos
  useEffect(() => {
    if (isAuthenticated) {
      // Si está autenticado, la aureola no es necesaria
      setLogoAura('none');
    } else {
      // Si no está autenticado, mostrar la aureola según haya mensajes
      setLogoAura(hasUnreadMessages ? 'red' : 'green');
    }
  }, [isAuthenticated, hasUnreadMessages]);
  
  // Escuchar eventos de actualización de mensajes no leídos
  useEffect(() => {
    const handleUnreadMessages = (event: CustomEvent) => {
      setHasUnreadMessages(event.detail.hasUnreadMessages);
    };
    
    const handleUnreadRequests = (event: CustomEvent) => {
      // También actualizamos basándonos en solicitudes pendientes
      if (event.detail.hasUnreadRequests) {
        setHasUnreadMessages(true);
      }
    };
    
    // Añadir escuchas de eventos
    window.addEventListener('unreadMessagesUpdate', handleUnreadMessages as EventListener);
    window.addEventListener('unreadRequestsUpdate', handleUnreadRequests as EventListener);
    
    // For demo purpose, simulate a new message after some time
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setHasUnreadMessages(true);
      }, 30000); // 30 seconds
      
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

  // Redirigir a autenticación si el usuario no está autenticado
  useEffect(() => {
    if (user) {
      setIsAuthenticated(false); // Inicialmente no autenticado hasta validar patrón
    } else if (!showPatternLock) {
      // Solo redirigir si no estamos en la pantalla de patrón
      // Esto permite que el patrón por defecto funcione sin autenticación
      //navigate('/auth');
    }
  }, [user, showPatternLock]);
  
  const handleSettingsClick = () => {
    setShowPatternLock(true);
  };
  
  const handlePatternComplete = async (pattern: number[]): Promise<boolean> => {
    // Verificar patrón con Supabase o usar el patrón predeterminado
    let isCorrect = false;
    
    if (user) {
      // Usuario autenticado, verificar patrón guardado en Supabase
      try {
        isCorrect = await patternService.verifyPattern(user.id, pattern);
      } catch (error) {
        console.error("Error al verificar patrón:", error);
        
        // Si hay error, intentar con el patrón predeterminado
        isCorrect = patternService.verifyDefaultPattern(pattern);
      }
    } else {
      // Usuario no autenticado, verificar con patrón predeterminado
      isCorrect = patternService.verifyDefaultPattern(pattern);
    }
    
    if (isCorrect) {
      setShowPatternLock(false);
      setIsAuthenticated(true);
      setHasUnreadMessages(false);
      return true; // Patrón correcto
    } else {
      return false; // Patrón incorrecto
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
      description: `El tema se ha cambiado a ${theme}`,
    });
  };

  // Renderizar el componente de camuflaje según el tema seleccionado
  const renderCamouflageApp = () => {
    // Añadimos la prop de logoAura a todos los componentes de tema
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
          
          {/* Settings button that's always available */}
          <div className="fixed bottom-4 right-4">
            <button 
              onClick={() => setShowThemeSelector(true)}
              className="p-3 bg-messenger-primary text-white rounded-full shadow-lg hover:bg-messenger-secondary transition-colors"
            >
              Tema
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1">
          {renderCamouflageApp()}
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
