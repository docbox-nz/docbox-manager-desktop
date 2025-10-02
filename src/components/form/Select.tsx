import {
  default as MuiSelect,
  type SelectProps as MuiSelectProps,
} from "@mui/material/Select";
import { useFieldContext } from "@/context/form-context";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";

type SelectProps = Omit<
  MuiSelectProps,
  "name" | "value" | "onChange" | "error"
> & {
  helperText?: string;
};

export default function Select({ helperText, label, ...rest }: SelectProps) {
  const field = useFieldContext<string>();

  return (
    <FormControl>
      {label && <InputLabel>{label}</InputLabel>}
      <MuiSelect
        {...rest}
        label={label}
        name={field.name}
        value={field.state.value}
        onChange={(event) => {
          field.handleChange(event.target.value as string);
        }}
        onBlur={field.handleBlur}
      />

      {(helperText ||
        (field.state.meta.errors && field.state.meta.errors.length > 0)) && (
        <FormHelperText error={!field.state.meta.isValid}>
          {field.state.meta.isValid
            ? helperText
            : field.state.meta.errors.map((error) => error?.message).join(", ")}
        </FormHelperText>
      )}
    </FormControl>
  );
}
