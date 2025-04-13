
import { useState } from 'react';
import { Request } from '@/components/Messenger/types';
import { useToast } from '@/hooks/use-toast';

export const useRequests = () => {
  const [pendingRequests, setPendingRequests] = useState<Request[]>([
    {
      id: '1',
      username: 'carlos92',
      timestamp: 'Hace 2h',
      status: 'pending'
    },
    {
      id: '2',
      username: 'laura.martinez',
      timestamp: 'Hace 1d',
      status: 'pending'
    }
  ]);
  
  const { toast } = useToast();

  const handleAcceptRequest = (requestId: string) => {
    const request = pendingRequests.find(req => req.id === requestId);
    
    if (!request) return null;
    
    setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
    
    toast({
      title: "Solicitud aceptada",
      description: `Has aceptado la solicitud de ${request.username}`,
    });
    
    return request;
  };

  const handleRejectRequest = (requestId: string) => {
    setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
    
    toast({
      title: "Solicitud rechazada",
      description: "La solicitud ha sido rechazada",
    });
  };

  const handleBlockRequest = (requestId: string) => {
    setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
    
    toast({
      variant: "destructive",
      title: "Usuario bloqueado",
      description: "El usuario ha sido bloqueado y no podrá enviarte más solicitudes",
    });
  };

  return {
    pendingRequests,
    setPendingRequests,
    handleAcceptRequest,
    handleRejectRequest,
    handleBlockRequest
  };
};
