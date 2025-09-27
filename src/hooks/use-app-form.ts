import { fieldContext, formContext } from "@/context/form-context";
import { createFormHook } from "@tanstack/react-form";

import TextField from "@components/form/TextField";
import Switch from "@components/form/Switch";
import ToggleButtonGroup from "@components/form/ToggleButtonGroup";

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    Switch,
    ToggleButtonGroup,
  },
  formComponents: {},
});
