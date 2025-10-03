import {
  AutocompleteValue,
  default as MuiAutocomplete,
  type AutocompleteProps as MuiAutocompleteProps,
} from "@mui/material/Autocomplete";
import { useFieldContext } from "@/context/form-context";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { ChipTypeMap } from "@mui/material/Chip";

type AutocompleteProps<
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = ChipTypeMap["defaultComponent"],
> = Omit<
  MuiAutocompleteProps<
    Value,
    Multiple,
    DisableClearable,
    FreeSolo,
    ChipComponent
  >,
  "name" | "value" | "onChange" | "error" | "renderInput"
> & {
  inputProps?: Partial<TextFieldProps>;
};

export default function Autocomplete<
  Value,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
  ChipComponent extends React.ElementType = ChipTypeMap["defaultComponent"],
>({
  inputProps,
  ...rest
}: AutocompleteProps<
  Value,
  Multiple,
  DisableClearable,
  FreeSolo,
  ChipComponent
>) {
  const field =
    useFieldContext<
      AutocompleteValue<Value, Multiple, DisableClearable, FreeSolo>
    >();

  return (
    <MuiAutocomplete<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>
      {...rest}
      fullWidth
      value={field.state.value}
      onChange={(_event, newValue) => field.handleChange(newValue)}
      onBlur={field.handleBlur}
      renderInput={(params) => (
        <TextField
          {...params}
          {...inputProps}
          name={field.name}
          error={!field.state.meta.isValid}
          helperText={
            field.state.meta.isValid
              ? inputProps?.helperText
              : field.state.meta.errors
                  .map((error) => error?.message)
                  .join(", ")
          }
        />
      )}
    />
  );
}
