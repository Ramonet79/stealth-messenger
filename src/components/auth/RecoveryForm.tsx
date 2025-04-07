
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertTriangle } from 'lucide-react';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema de validación para el formulario de recuperación
const recoverySchema = z.object({
  recoveryEmail: z.string().email("Correo electrónico inválido"),
});

type RecoveryFormProps = {
  onCancel: () => void;
};

export const RecoveryForm = ({ onCancel }: RecoveryFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuración del formulario
  const form = useForm<z.infer<typeof recoverySchema>>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      recoveryEmail: "",
    },
  });

  // Handler para el envío del formulario (deshabilitado)
  const handleSubmit = async (data: z.infer<typeof recoverySchema>) => {
    setIsSubmitting(true);
    
    // Mostrar toast informativo
    toast({
      title: "Función temporalmente deshabilitada",
      description: "La recuperación de cuenta mediante correo de recuperación está temporalmente deshabilitada.",
      variant: "destructive"
    });
    
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="flex justify-center mb-6">
        <img src="/lovable-uploads/3f963389-b035-45c6-890b-824df3549300.png" 
          alt="dScrt Logo" 
          className="h-20 w-20 rounded-lg" />
      </div>
      
      <h1 className="text-2xl font-bold mb-4 text-center">
        Recuperar acceso a tu cuenta
      </h1>
      
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          La recuperación de cuenta mediante correo de recuperación está temporalmente deshabilitada.
        </AlertDescription>
      </Alert>
      
      <p className="text-sm text-gray-500 mb-4 text-center">
        Por favor, intenta iniciar sesión con tu correo y contraseña directamente.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="recoveryEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo de recuperación</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email" 
                    placeholder="tu-correo-recuperacion@email.com" 
                    disabled={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={true}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Recuperar cuenta
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full mt-2"
            onClick={onCancel}
          >
            Volver al inicio de sesión
          </Button>
        </form>
      </Form>
    </>
  );
};
