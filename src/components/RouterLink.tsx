import * as React from "react";
import { Link, type LinkProps } from "@tanstack/react-router";
import Box, { BoxProps } from "@mui/material/Box";

// Forward the ref to integrate with MUI correctly
const RouterLink = React.forwardRef<HTMLAnchorElement, LinkProps & BoxProps>(
  function RouterLink(props, ref) {
    return <Box component={Link} {...props} ref={ref} />;
  }
);

export default RouterLink;
