import { fieldContext, formContext } from "@/context/form-context";
import { createFormHook } from "@tanstack/react-form";

import TextField from "@components/form/TextField";
import Switch from "@components/form/Switch";
import ToggleButtonGroup from "@components/form/ToggleButtonGroup";
import Select from "@components/form/Select";
import Autocomplete from "@/components/form/Autocomplete";
import Checkbox from "@/components/form/Checkbox";
import UploadFiles from "@/components/form/UploadFiles";

export const { useAppForm, withFieldGroup, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    Switch,
    ToggleButtonGroup,
    Select,
    Autocomplete,
    Checkbox,
    UploadFiles,
  },
  formComponents: {},
});
