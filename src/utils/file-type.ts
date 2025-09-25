import { GeneratedFileType } from "@docbox-nz/docbox-sdk";
import audio from "../assets/audio.svg";
import document from "../assets/document.svg";
import generic from "../assets/generic.svg";
import image from "../assets/image.svg";
import pdf from "../assets/pdf.svg";
import ppt from "../assets/ppt.svg";
import txt from "../assets/txt.svg";
import video from "../assets/video.svg";
import xls from "../assets/xls.svg";
import { FileType } from "../types/file-type";

export const FILE_TYPE_ICON_MAPPING: Record<FileType, string> = {
  [FileType.Audio]: audio,
  [FileType.Document]: document,
  [FileType.Image]: image,
  [FileType.Pdf]: pdf,
  [FileType.Presentation]: ppt,
  [FileType.Text]: txt,
  [FileType.Video]: video,
  [FileType.Spreadsheet]: xls,
  [FileType.Generic]: generic,
};

export enum FilePreviewType {
  PDF,
  IMAGE,
  EMAIL,
  GENERATED_PDF,
}

export function getFilePreviewType(
  mime: string,
  generatedTypes: GeneratedFileType[] = [],
): FilePreviewType | null {
  let previewFormat: FilePreviewType | null = null;

  // Check for known preview file types
  if (PDF_MIME_TYPES.includes(mime)) {
    previewFormat = FilePreviewType.PDF;
  } else if (mime.startsWith("image/")) {
    previewFormat = FilePreviewType.IMAGE;
  } else if (EMAIL_MIME_TYPES.includes(mime)) {
    previewFormat = FilePreviewType.EMAIL;
  }

  // Generated pdf is available
  if (generatedTypes.includes(GeneratedFileType.PDF)) {
    return FilePreviewType.GENERATED_PDF;
  }

  return previewFormat;
}

const EMAIL_MIME_TYPES = ["message/rfc822"];

const DOCUMENT_MIME_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-word.template.macroenabled.12",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
];

const SPREADSHEET_MIME_TYPES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel.sheet.macroenabled.12",
];

const PRESENTATION_MIME_TYPES = [
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint.presentation.macroenabled.12",
];

const TEXT_MIME_TYPES = ["text/plain", "text/csv", "text/html"];

const PDF_MIME_TYPES = ["application/pdf", "application/x-pdf"];

export function getFileExtension(name: string): string | null {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1 || dotIndex === name.length - 1) return null;
  return name.substring(dotIndex + 1).toLowerCase();
}

export function getFileTypeFromMime(mime: string): FileType {
  if (mime.startsWith("image/")) {
    return FileType.Image;
  }

  if (mime.startsWith("audio/")) {
    return FileType.Audio;
  }

  if (mime.startsWith("video/")) {
    return FileType.Video;
  }

  if (PDF_MIME_TYPES.includes(mime)) {
    return FileType.Pdf;
  }

  if (DOCUMENT_MIME_TYPES.includes(mime)) {
    return FileType.Document;
  }

  if (SPREADSHEET_MIME_TYPES.includes(mime)) {
    return FileType.Spreadsheet;
  }

  if (PRESENTATION_MIME_TYPES.includes(mime)) {
    return FileType.Presentation;
  }

  if (TEXT_MIME_TYPES.includes(mime)) {
    return FileType.Text;
  }

  return FileType.Generic;
}
