import { invoke } from "@tauri-apps/api/core";
import { EncryptedContent } from "./utils.types";

export function encrypt(
  password: string,
  input: string
): Promise<EncryptedContent> {
  return invoke("utils_encrypt", { password, input });
}
