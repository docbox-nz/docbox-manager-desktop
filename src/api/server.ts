import { z } from "zod/v4";

export enum ServerConfigType {
  AwsSecret = "aws_secret",
  Config = "config",
  Encrypted = "encrypted",
}

export enum SecretsManagerConfigType {
  Memory = "memory",
  Json = "json",
  Aws = "aws",
}

export enum SearchIndexFactoryConfigType {
  Typesense = "typesense",
  OpenSearch = "open_search",
  Database = "database",
}

export enum StorageLayerFactoryConfigType {
  S3 = "s3",
}

export enum S3EndpointType {
  Aws = "aws",
  Custom = "custom",
}

export const awsS3EndpointSchema = z.object({
  type: z.literal(S3EndpointType.Aws),
});

export type AwsS3Endpoint = z.infer<typeof awsS3EndpointSchema>;

export const customS3EndpointSchema = z.object({
  type: z.literal(S3EndpointType.Custom),
  access_key_id: z.string(),
  access_key_secret: z.string(),
});

export type CustomS3Endpoint = z.infer<typeof customS3EndpointSchema>;

export const s3Endpoint = z.discriminatedUnion("type", [
  awsS3EndpointSchema,
  customS3EndpointSchema,
]);

export type S3Endpoint = z.infer<typeof s3Endpoint>;

export const s3StorageLayerFactoryConfig = z.object({
  provider: z.literal(StorageLayerFactoryConfigType.S3),
  endpoint: s3Endpoint,
});

export const storageLayerFactoryConfigSchema = z.discriminatedUnion(
  "provider",
  [s3StorageLayerFactoryConfig]
);

export const typesenseSearchConfigSchema = z.object({
  provider: z.literal(SearchIndexFactoryConfigType.Typesense),
  url: z.string(),
  api_key: z.string().optional().nullable(),
  api_key_secret_name: z.string().optional().nullable(),
});

export const opensearchSearchConfigSchema = z.object({
  provider: z.literal(SearchIndexFactoryConfigType.OpenSearch),
  url: z.string(),
});

export const databaseSearchConfigSchema = z.object({
  provider: z.literal(SearchIndexFactoryConfigType.Database),
});

export const searchConfigSchema = z.discriminatedUnion("provider", [
  typesenseSearchConfigSchema,
  opensearchSearchConfigSchema,
  databaseSearchConfigSchema,
]);

export const memorySecretManagerConfigSchema = z.object({
  provider: z.literal(SecretsManagerConfigType.Memory),
  secrets: z.record(z.string(), z.string()).optional().nullable(),
  default: z.string().optional().nullable(),
});

export const jsonSecretManagerConfigSchema = z.object({
  provider: z.literal(SecretsManagerConfigType.Json),
  key: z.string(),
  path: z.string(),
});

export const awsSecretManagerConfigSchema = z.object({
  provider: z.literal(SecretsManagerConfigType.Aws),
});

export const secretManagerConfigSchema = z.discriminatedUnion("provider", [
  memorySecretManagerConfigSchema,
  jsonSecretManagerConfigSchema,
  awsSecretManagerConfigSchema,
]);

export const adminDatabaseSetupUserConfigSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const adminDatabaseConfigSchema = z.object({
  host: z.string(),
  port: z.string(),
  setup_user: adminDatabaseSetupUserConfigSchema.optional().nullable(),
  setup_user_secret_name: z.string().optional().nullable(),
  root_secret_name: z.string(),
});

export const serverConfigDataSchema = z.object({
  api_url: z.string(),
  database: adminDatabaseConfigSchema,
  secrets: secretManagerConfigSchema,
  search: searchConfigSchema,
  storage: storageLayerFactoryConfigSchema,
});

export type ServerConfigData = z.infer<typeof serverConfigDataSchema>;

export const serverConfigAwsSecretSchema = z.object({
  type: z.literal(ServerConfigType.AwsSecret),
  secret_name: z.string(),
});

export const serverConfigConfigSchema = z.object({
  type: z.literal(ServerConfigType.Config),
});

export const serverConfigEncryptedSchema = z.object({
  type: z.literal(ServerConfigType.Encrypted),
});

export const serverConfigSchema = z.discriminatedUnion("type", [
  serverConfigAwsSecretSchema,
  serverConfigConfigSchema,
  serverConfigEncryptedSchema,
]);
