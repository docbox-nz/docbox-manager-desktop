import { DocLink, DocumentBoxScope } from "@docbox-nz/docbox-sdk";
import { useRef, useState, useEffect, PropsWithChildren } from "react";

import Box from "@mui/material/Box";
import { Card, Portal } from "@mui/material";
import { Theme, SxProps } from "@mui/material/styles";
import { useDocboxClient, useDocboxEndpoint } from "./DocboxProvider";
import MdiInternet from "~icons/mdi/internet";
import RouterLink from "../RouterLink";

type Props = {
  // The link to show the thumbnail for
  link: DocLink;
  // The scope the link is within
  scope: DocumentBoxScope;
  // Show a full sized preview image in a tooltip
  previewTooltip?: boolean;
  // Additional styling to apply to the thumbnail
  sx?: SxProps<Theme>;
};

export default function DocboxLinkThumbnail({
  link,
  scope,
  previewTooltip,
  sx,
}: Props) {
  // Load failure state for the favicon
  const [loadFaviconFailed, setLoadFaviconFailed] = useState(false);

  // Portion added to the image URLs for cache busting outdated link metadata
  const linkUniquePortion = encodeURIComponent(
    link.value + link.last_modified_at,
  );

  const client = useDocboxClient();
  const endpoint = useDocboxEndpoint();

  // URL for the favicon
  let faviconURL = `${endpoint(
    client.link.faviconURL(scope, link.id),
  )}?value=${linkUniquePortion}`;

  // URL for the OGP image
  let imageURL = `${endpoint(
    client.link.imageURL(scope, link.id),
  )}?value=${linkUniquePortion}`;

  let thumbnailImage;

  if (!loadFaviconFailed) {
    // Attempt to use the thumbnail preview
    thumbnailImage = (
      <Box
        component="img"
        src={faviconURL}
        sx={{
          width: 32,
          height: 32,
          flexShrink: 0,
          objectFit: "cover",
          ...sx,
        }}
        onError={() => setLoadFaviconFailed(true)}
      />
    );
  } else {
    // Fallback to default link icon
    thumbnailImage = (
      <Box component={MdiInternet} width={32} height={32} flexShrink={0} />
    );
  }

  let renderContent = (
    <Box
      sx={{
        display: "contents",
      }}
      component={RouterLink}
      href={link.value}
      target="_blank"
    >
      {thumbnailImage}
    </Box>
  );

  // If previewing is enabled and hasn't failed to load, add a preview tooltip
  if (previewTooltip) {
    renderContent = (
      <CenterPreview imageURL={imageURL}>{renderContent}</CenterPreview>
    );
  }

  return renderContent;
}

function CenterPreview({
  children,
  imageURL,
}: PropsWithChildren<{
  imageURL: string;
}>) {
  const [open, setOpen] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const thumbnailRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return () => {};

    const handleMouseMove = (e: MouseEvent) => {
      const rect = thumbnailRef.current?.getBoundingClientRect();
      const insideThumbnail =
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      const contentRect = contentRef.current?.getBoundingClientRect();
      const insideContent =
        contentRect &&
        e.clientX >= contentRect.left &&
        e.clientX <= contentRect.right &&
        e.clientY >= contentRect.top &&
        e.clientY <= contentRect.bottom;

      if (!insideThumbnail && !insideContent) {
        setOpen(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [open]);

  return (
    <>
      <Box
        ref={thumbnailRef}
        onMouseEnter={() => setOpen(true)}
        sx={{ cursor: "pointer", width: 32, height: 32, flexShrink: 0 }}
      >
        {children}
      </Box>

      {open && !loadFailed && (
        <Portal container={document.body}>
          <Card
            sx={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              zIndex: (theme) => theme.zIndex.modal + 2,
              boxShadow: (theme) => theme.shadows[24],
            }}
          >
            <Box
              component={"img"}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              ref={contentRef}
              src={imageURL}
              sx={{
                width: 1,
                height: 1,
                maxWidth: 600,
                borderRadius: 1,
                py: 0.5,
              }}
              onError={() => setLoadFailed(true)}
            />
          </Card>
        </Portal>
      )}
    </>
  );
}
