import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ComponentPropsWithoutRef } from "react";
import { Control, FieldValues, Path } from "react-hook-form";

type FormInputNoLabelProps<TFieldValues extends FieldValues> = {
  id: string;
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  description?: string;
  type?: string;
  inputProps?: Omit<
    ComponentPropsWithoutRef<typeof Input>,
    "id" | "name" | "type"
  >;
};

export function FormInputNoLabel<TFieldValues extends FieldValues>({
  id,
  control,
  name,
  description,
  type,
  inputProps,
}: FormInputNoLabelProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input id={id} type={type} {...inputProps} {...field} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

