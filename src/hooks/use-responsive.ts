import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, type Breakpoint } from "@mui/material/styles";

export type Value = Breakpoint | number;

export function useResponsiveUp(start: Value) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up(start));
}

export function useResponsiveDown(start: Value) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(start));
}
