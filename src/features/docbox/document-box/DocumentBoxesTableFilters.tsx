import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

type Props = {
  query: string;
  setQuery: (value: string) => void;
};

/**
 *
 */
export default function DocumentBoxesTableFilters({ query, setQuery }: Props) {
  return (
    <Stack direction="row" gap={2} sx={{ width: 1 }}>
      <TextField
        label="Search by scope..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        sx={{ flex: "auto" }}
      />

      {/* TODO: Help icon showcasing wildcards for searching */}
    </Stack>
  );
}
