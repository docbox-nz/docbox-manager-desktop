import {
  default as MuiTextField,
  type TextFieldProps as MuiTextFieldProps,
} from "@mui/material/TextField";
import { useFieldContext } from "@/context/form-context";

type TextFieldProps = Omit<
  MuiTextFieldProps,
  "name" | "value" | "onChange" | "error"
>;

export default function TextField({ ...rest }: TextFieldProps) {
  const field = useFieldContext<string>();

  return (
    <MuiTextField
      {...rest}
      fullWidth
      name={field.name}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
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
