import {
  default as MuiCheckbox,
  type CheckboxProps as MuiCheckboxProps,
} from "@mui/material/Checkbox";
import { useFieldContext } from "@/context/form-context";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";

type CheckboxProps = Omit<
  MuiCheckboxProps,
  "name" | "value" | "onChange" | "error"
> & {
  label?: string;
  helperText?: string;
};

export default function Checkbox({
  label,
  helperText,
  ...rest
}: CheckboxProps) {
  const field = useFieldContext<boolean>();

  const renderCheckbox = (
    <MuiCheckbox
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
    <FormControlLabel control={renderCheckbox} label={label} />
  ) : (
    renderCheckbox
  );

  return (
    <FormControl>
      {renderContainer}

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
