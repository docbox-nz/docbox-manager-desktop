import Stack from "@mui/material/Stack";
import Input from "@mui/material/Input";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

type Props = {
  query: string;
  environments: string[];
  availableEnvironments: string[];

  setQuery: (value: string) => void;
  setEnvironments: (values: string[]) => void;
};

/**
 *
 */
export default function TenantTableFilters({
  query,
  environments,
  availableEnvironments,
  setQuery,
  setEnvironments,
}: Props) {
  return (
    <Stack direction="row" gap={2} sx={{ width: 1 }}>
      <TextField
        label="Search by name..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        sx={{ flex: "auto" }}
      />

      <Autocomplete
        multiple
        value={environments}
        onChange={(_event, value) => setEnvironments(value)}
        options={availableEnvironments}
        renderInput={(params) => (
          <TextField
            {...params}
            sx={{ minWidth: 300, flex: "auto" }}
            label="Environments"
          />
        )}
      />
    </Stack>
  );
}
