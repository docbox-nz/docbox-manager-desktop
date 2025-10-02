import { fieldContext, formContext } from "@/context/form-context";
import { createFormHook } from "@tanstack/react-form";

import TextField from "@components/form/TextField";
import Switch from "@components/form/Switch";
import ToggleButtonGroup from "@components/form/ToggleButtonGroup";
import Select from "@components/form/Select";

export const { useAppForm, withFieldGroup, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    Switch,
    ToggleButtonGroup,
    Select,
  },
  formComponents: {},
});
