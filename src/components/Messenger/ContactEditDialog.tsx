
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Contact } from './types';

interface ContactEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editForm: {
    name: string;
    fullName: string;
    notes: string;
  };
  onEditFormChange: (field: string, value: string) => void;
  onSave: () => void;
}

const ContactEditDialog: React.FC<ContactEditDialogProps> = ({
  isOpen,
  onClose,
  editForm,
  onEditFormChange,
  onSave
}) => {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('contacts.edit') || 'Editar contacto'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('contacts.username') || 'Nombre de usuario'}
            </label>
            <Input 
              value={editForm.name}
              onChange={(e) => onEditFormChange('name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('contacts.fullName') || 'Nombre completo'}
            </label>
            <Input 
              value={editForm.fullName}
              onChange={(e) => onEditFormChange('fullName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('contacts.notes') || 'Notas'}
            </label>
            <Textarea 
              value={editForm.notes}
              onChange={(e) => onEditFormChange('notes', e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel') || 'Cancelar'}
          </Button>
          <Button onClick={onSave}>
            {t('save') || 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactEditDialog;
