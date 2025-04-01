
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Lista de idiomas soportados según la hoja de ruta
type SupportedLanguage = 
  | 'es-ES'   // Español (España)
  | 'en-US'   // Inglés (EE.UU.)
  | 'en-GB'   // Inglés (Reino Unido)
  | 'fr'      // Francés
  | 'it'      // Italiano
  | 'de'      // Alemán  
  | 'es-419'  // Español (Latinoamérica)
  | 'es-MX'   // Español (México)
  | 'nl'      // Neerlandés
  | 'fi'      // Finés
  | 'ar'      // Árabe
  | 'zh'      // Chino
  | 'hi';     // Hindi

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

// Valores por defecto
const defaultLanguage: SupportedLanguage = 'en-US';

// Creamos el contexto
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traducciones
const translations: Record<SupportedLanguage, Record<string, string>> = {
  'es-ES': {
    'welcome': 'Bienvenido a dScrt',
    'app_description': 'La aplicación para comunicaciones discretas',
    'pending_requests': 'Solicitudes pendientes',
    'no_pending_requests': 'No tienes solicitudes pendientes',
    'requests_expire': 'Las solicitudes caducan automáticamente después de 24 horas si no son respondidas.',
    'accept': 'Aceptar',
    'reject': 'Rechazar',
    'block': 'Bloquear',
    'new_message': 'Nuevo mensaje',
    'continue': 'Continuar',
    'back': 'Atrás',
    'save': 'Guardar',
    'phone_number': 'Número de teléfono',
    'contact_name': 'Nombre de contacto',
    'phone_placeholder': 'Introduce el número',
    'name_placeholder': 'Introduce un nombre',
    'no_conversations': 'No tienes conversaciones',
    'share_username': 'Comparte tu nombre de usuario con personas de confianza para iniciar conversaciones',
    'click_scan': 'Haga clic para escanear un documento',
    'tap_scan': 'Pulse para escanear',
    'scanning': 'Escaneando...',
    'scan_now': 'Escanear ahora',
    'supported_formats': 'Formatos soportados: PDF, JPG, PNG',
    'browse_files': 'Explorar archivos',
    'empty': 'Vacío',
  },
  'en-US': {
    'welcome': 'Welcome to dScrt',
    'app_description': 'The app for discreet communications',
    'pending_requests': 'Pending requests',
    'no_pending_requests': 'You have no pending requests',
    'requests_expire': 'Requests automatically expire after 24 hours if not answered.',
    'accept': 'Accept',
    'reject': 'Reject',
    'block': 'Block',
    'new_message': 'New message',
    'continue': 'Continue',
    'back': 'Back',
    'save': 'Save',
    'phone_number': 'Phone number',
    'contact_name': 'Contact name',
    'phone_placeholder': 'Enter the number',
    'name_placeholder': 'Enter a name',
    'no_conversations': 'You have no conversations',
    'share_username': 'Share your username with trusted people to start conversations',
    'click_scan': 'Click to scan a document',
    'tap_scan': 'Tap to scan',
    'scanning': 'Scanning...',
    'scan_now': 'Scan now',
    'supported_formats': 'Supported formats: PDF, JPG, PNG',
    'browse_files': 'Browse files',
    'empty': 'Empty',
  },
  // Se implementan traducciones iniciales para inglés británico
  'en-GB': {
    'welcome': 'Welcome to dScrt',
    'app_description': 'The app for discreet communications',
    'pending_requests': 'Pending requests',
    'no_pending_requests': 'You have no pending requests',
    'requests_expire': 'Requests automatically expire after 24 hours if not answered.',
    'accept': 'Accept',
    'reject': 'Reject',
    'block': 'Block',
    'new_message': 'New message',
    'continue': 'Continue',
    'back': 'Back',
    'save': 'Save',
    'phone_number': 'Phone number',
    'contact_name': 'Contact name',
    'phone_placeholder': 'Enter the number',
    'name_placeholder': 'Enter a name',
    'no_conversations': 'You have no conversations',
    'share_username': 'Share your username with trusted people to start conversations',
    'click_scan': 'Click to scan a document',
    'tap_scan': 'Tap to scan',
    'scanning': 'Scanning...',
    'scan_now': 'Scan now',
    'supported_formats': 'Supported formats: PDF, JPG, PNG',
    'browse_files': 'Browse files',
    'empty': 'Empty',
  },
  // Versiones iniciales para los demás idiomas (se completarían con traducciones adecuadas)
  'fr': { /* Traducciones en francés */ },
  'it': { /* Traducciones en italiano */ },
  'de': { /* Traducciones en alemán */ },
  'es-419': { /* Traducciones en español latinoamericano */ },
  'es-MX': { /* Traducciones en español mexicano */ },
  'nl': { /* Traducciones en neerlandés */ },
  'fi': { /* Traducciones en finés */ },
  'ar': { /* Traducciones en árabe */ },
  'zh': { /* Traducciones en chino */ },
  'hi': { /* Traducciones en hindi */ }
};

// Por ahora usamos el idioma español e inglés completamente traducidos, los demás usarán inglés como fallback
for (const lang in translations) {
  if (lang !== 'es-ES' && lang !== 'en-US' && lang !== 'en-GB') {
    translations[lang as SupportedLanguage] = { ...translations['en-US'] };
  }
}

export const LanguageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(defaultLanguage);

  useEffect(() => {
    // Detectar idioma del sistema al cargar
    const detectSystemLanguage = () => {
      const systemLanguage = navigator.language;
      
      // Verificar si el idioma del sistema está soportado
      if (systemLanguage in translations) {
        setLanguageState(systemLanguage as SupportedLanguage);
      } else {
        // Si no está soportado exactamente, intentamos encontrar una variante
        const baseLanguage = systemLanguage.split('-')[0];
        const matchingLanguage = Object.keys(translations).find(
          lang => lang.startsWith(baseLanguage)
        );
        
        if (matchingLanguage) {
          setLanguageState(matchingLanguage as SupportedLanguage);
        } else {
          // Si no hay coincidencia, usar inglés estadounidense por defecto
          setLanguageState('en-US');
        }
      }
    };

    detectSystemLanguage();
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    // Aquí podríamos guardar la preferencia en localStorage si queremos persistencia
    localStorage.setItem('dscrt-language', lang);
  };

  // Función de traducción
  const t = (key: string): string => {
    const currentTranslations = translations[language] || translations[defaultLanguage];
    return currentTranslations[key] || key; // Si no existe la traducción, devolvemos la clave
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook personalizado para acceder al contexto
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
