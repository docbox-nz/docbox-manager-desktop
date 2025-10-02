import { invoke } from "@tauri-apps/api/core";
import { EncryptedContent } from "./utils.types";

export function encrypt(
  password: string,
  input: string,
): Promise<EncryptedContent> {
  return invoke("utils_encrypt", { password, input });
}

export function getAWSProfiles(): Promise<string[]> {
  return invoke("utils_get_aws_profiles");
}
