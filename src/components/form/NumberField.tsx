import {
  default as MuiTextField,
  type TextFieldProps as MuiTextFieldProps,
} from "@mui/material/TextField";
import { useFieldContext } from "@/context/form-context";

type NumberFieldProps = Omit<
  MuiTextFieldProps,
  "name" | "type" | "value" | "onChange" | "error"
>;

export default function NumberField({ ...rest }: NumberFieldProps) {
  const field = useFieldContext<number>();

  return (
    <MuiTextField
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
