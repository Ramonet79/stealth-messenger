
import React from 'react';
import { ArrowLeft, Check, X, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Request {
  id: string;
  username: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  // Añadimos expirationDate según la hoja de ruta
  expirationDate?: string;
}

interface RequestsListProps {
  requests: Request[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onBlock: (id: string) => void;
  onBack: () => void;
}

const RequestsList: React.FC<RequestsListProps> = ({
  requests,
  onAccept,
  onReject,
  onBlock,
  onBack
}) => {
  const { t } = useLanguage();
  
  // Función para calcular tiempo restante hasta caducidad
  const getRemainingTime = (request: Request) => {
    if (!request.expirationDate) return '';
    
    const now = new Date();
    const expiration = new Date(request.expirationDate);
    const diffHours = Math.floor((expiration.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor((expiration.getTime() - now.getTime()) / (1000 * 60));
      return `${diffMinutes} min`;
    }
    
    return `${diffHours} h`;
  };

  return (
    <div className="flex flex-col h-full bg-messenger-background">
      <div className="flex items-center p-4 border-b">
        <button 
          onClick={onBack}
          className="mr-3 p-2 rounded-full hover:bg-gray-200 transition-colors"
          aria-label={t('back')}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">{t('pending_requests')}</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <p>{t('no_pending_requests')}</p>
          </div>
        ) : (
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-4">
              {t('requests_expire')}
            </p>
            
            {requests.map((request) => (
              <div 
                key={request.id}
                className="mb-4 rounded-lg border bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium">{request.username}</div>
                    <div className="flex items-center">
                      <div className="text-xs text-gray-500 mr-2">{request.timestamp}</div>
                      {request.expirationDate && (
                        <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {t('expires_in')}: {getRemainingTime(request)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-medium">
                    {request.username.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onAccept(request.id)} 
                    className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center"
                  >
                    <Check size={16} className="mr-1" />
                    {t('accept')}
                  </button>
                  <button 
                    onClick={() => onReject(request.id)} 
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center"
                  >
                    <X size={16} className="mr-1" />
                    {t('reject')}
                  </button>
                  <button 
                    onClick={() => onBlock(request.id)} 
                    className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center"
                  >
                    <Shield size={16} className="mr-1" />
                    {t('block')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsList;
