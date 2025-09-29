import { ServerConfigData } from "../server";

export interface Server {
  id: string;
  name: string;
  order: number;
}

export interface CreateServer {
  id: string;
  name: string;
  config: ServerConfig;
  order: number;
}

export enum ServerConfigType {
  AwsSecret = "aws_secret",
  Config = "config",
  Encrypted = "encrypted",
}

export type ServerConfig =
  | ({ type: ServerConfigType.AwsSecret } & ServerConfigAwsSecret)
  | ({ type: ServerConfigType.Config } & ServerConfigConfig)
  | ({ type: ServerConfigType.Encrypted } & ServerConfigEncrypted);

export interface ServerConfigAwsSecret {
  secret_name: string;
}

export interface ServerConfigConfig {
  data: ServerConfigData;
}

export interface ServerConfigEncrypted {
  salt: number[];
  nonce: number[];
  data: number[];
}

export interface LoadServerConfig {
  password?: string | null;
}

export interface StorageVerifyOutcome {
  create_bucket: VerifyOutcome;
  upload_file: VerifyOutcome;
  get_file: VerifyOutcome;
  delete_file: VerifyOutcome;
  create_presigned: VerifyOutcome;
  create_presigned_download: VerifyOutcome;
  delete_bucket: VerifyOutcome;
}

export type VerifyOutcome =
  | {
      type: "Pending";
    }
  | { type: "Success" }
  | { type: "Skipped" }
  | { type: "Failure"; message: string };
