
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/contexts/LanguageContext';

interface PrivacyNoticeProps {
  onClose: () => void;
}

const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ onClose }) => {
  const { t } = useLanguage();
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Alert className="max-w-md mx-auto bg-white shadow-lg rounded-md p-6">
        <div className="flex flex-col space-y-4">
          <AlertDescription className="text-base leading-relaxed">
            {t('media_privacy_notice')}
          </AlertDescription>
          
          <Button 
            onClick={onClose}
            className="w-full bg-messenger-primary hover:bg-messenger-secondary text-white"
          >
            {t('understand')}
          </Button>
        </div>
      </Alert>
    </div>
  );
};

export default PrivacyNotice;
