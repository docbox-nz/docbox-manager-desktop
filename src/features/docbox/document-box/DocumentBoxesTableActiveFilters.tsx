import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  query: string;
  filteredResults: number;

  setQuery: (value: string) => void;
};

export default function DocumentBoxesTableActiveFilters({
  query,
  filteredResults,
  setQuery,
}: Props) {
  return (
    <Stack gap={2}>
      <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
        {query.trim().length > 0 && (
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1}
            alignItems="center"
            sx={{
              p: 1,
              pl: 2,
              borderRadius: 6,
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: (theme) => theme.palette.grey[700],
            }}
          >
            <Typography variant="body2">Scope:</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
              <Chip label={query} onDelete={() => setQuery("")} />
            </Stack>
          </Stack>
        )}
      </Stack>

      {filteredResults > 0 ? (
        <Typography sx={{ p: 1 }}>
          {filteredResults} result{filteredResults > 1 ? "s" : ""}
        </Typography>
      ) : (
        <Typography sx={{ p: 1 }}>No results matching filters</Typography>
      )}
    </Stack>
  );
}
