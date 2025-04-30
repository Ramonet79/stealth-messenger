import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface UsernameFieldProps {
  form: {
    control: Control<any>;
    register: any;
  };
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
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
            <Input placeholder="Tu nombre de usuario" {...field} onBlur={onBlur} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
