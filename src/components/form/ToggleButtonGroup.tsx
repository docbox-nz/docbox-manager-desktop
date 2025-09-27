import {
  default as MuiToggleButtonGroup,
  type ToggleButtonGroupProps as MuiToggleButtonGroupProps,
} from "@mui/material/ToggleButtonGroup";
import { useFieldContext } from "@/context/form-context";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Typography from "@mui/material/Typography";

type ToggleButtonGroupProps = Omit<
  MuiToggleButtonGroupProps,
  "name" | "value" | "onChange" | "error"
> & {
  label?: string;
  helperText?: string;
  disableClearable?: boolean;
};

export default function ToggleButtonGroup({
  label,
  helperText,
  children,
  disableClearable,
  ...rest
}: ToggleButtonGroupProps) {
  const field = useFieldContext<string>();

  return (
    <FormControl>
      {label && (
        <Typography variant="body1" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}

      <MuiToggleButtonGroup
        {...rest}
        sx={{ ...rest.sx, mb: 1 }}
        value={field.state.value}
        onChange={(_event, value) => {
          if (value === null && disableClearable) {
            return;
          }

          field.handleChange(value);
        }}
        onBlur={field.handleBlur}
      >
        {children}
      </MuiToggleButtonGroup>

      {helperText ||
        (field.state.meta.errors && field.state.meta.errors.length > 0 && (
          <FormHelperText error={!field.state.meta.isValid}>
            {field.state.meta.isValid
              ? helperText
              : field.state.meta.errors
                  .map((error) => error?.message)
                  .join(", ")}
          </FormHelperText>
        ))}
    </FormControl>
  );
}
