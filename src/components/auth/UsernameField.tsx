
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface UsernameFieldProps {
  form: {
    control: Control<any>;
  };
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const UsernameField = ({ form, onBlur }: UsernameFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nombre de usuario</FormLabel>
          <FormControl>
            <Input 
              placeholder="Tu nombre de usuario" 
              {...field} 
              onBlur={(e) => {
                field.onBlur(); // Mantener el comportamiento original del field
                if (onBlur) onBlur(e); // Ejecutar el onBlur personalizado si existe
              }} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
