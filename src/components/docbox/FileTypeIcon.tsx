import { FileType } from "@/types/file-type";
import Box, { type BoxProps } from "@mui/material/Box";
import { FILE_TYPE_ICON_MAPPING } from "@/utils/file-type";

export type FileTypeIconProps = {
  fileType: FileType;
} & BoxProps;

export default function FileTypeIcon({
  fileType,
  ...restProps
}: FileTypeIconProps) {
  return (
    <Box
      component="img"
      src={FILE_TYPE_ICON_MAPPING[fileType]}
      {...restProps}
    />
  );
}
