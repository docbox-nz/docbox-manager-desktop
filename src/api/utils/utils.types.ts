export interface EncryptedContent {
  salt: number[];
  nonce: number[];
  data: number[];
}
