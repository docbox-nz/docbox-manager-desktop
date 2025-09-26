import { type AnyFieldApi } from "@tanstack/react-form";
import TextField, { type TextFieldProps } from "@mui/material/TextField";

type FormTextFieldProps = Omit<
  TextFieldProps,
  "name" | "value" | "onChange" | "error"
> & {
  field: AnyFieldApi;
};

export function FormNumberField({ field, ...rest }: FormTextFieldProps) {
  return (
    <TextField
      {...rest}
      type="number"
      fullWidth
      name={field.name}
      value={field.state.value}
      onChange={(event) => field.handleChange(Number(event.target.value))}
      onBlur={field.handleBlur}
      error={!field.state.meta.isValid}
      helperText={
        field.state.meta.isValid
          ? rest.helperText
          : field.state.meta.errors.map((error) => error?.message).join(", ")
      }
    />
  );
}
