import {
  default as MuiSwitch,
  type SwitchProps as MuiSwitchProps,
} from "@mui/material/Switch";
import { useFieldContext } from "@/context/form-context";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";

type SwitchProps = Omit<
  MuiSwitchProps,
  "name" | "value" | "onChange" | "error"
> & {
  label?: string;
  helperText?: string;
};

export default function Switch({ label, helperText, ...rest }: SwitchProps) {
  const field = useFieldContext<boolean>();

  const renderSwitch = (
    <MuiSwitch
      {...rest}
      name={field.name}
      checked={field.state.value}
      onChange={(_event, checked) => {
        field.handleChange(checked);
      }}
      onBlur={field.handleBlur}
    />
  );

  const renderContainer = label ? (
    <FormControlLabel control={renderSwitch} label={label} />
  ) : (
    renderSwitch
  );

  return (
    <FormControl>
      {renderContainer}

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
