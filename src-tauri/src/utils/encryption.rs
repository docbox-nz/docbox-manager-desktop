use argon2::{password_hash::rand_core::RngCore, Argon2};
use chacha20poly1305::{
    aead::{Aead, KeyInit, OsRng},
    AeadCore, Key, XChaCha20Poly1305, XNonce,
};
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Serialize, Deserialize)]
pub struct EncryptedContent {
    pub salt: Vec<u8>,
    pub nonce: Vec<u8>,
    pub data: Vec<u8>,
}

#[derive(Debug, Error)]
pub enum EncryptError {
    #[error("failed to hash password")]
    HashPassword(argon2::Error),

    #[error("failed to encrypt data")]
    Encrypt(chacha20poly1305::Error),
}

#[derive(Debug, Error)]
pub enum DecryptError {
    #[error("failed to hash password")]
    HashPassword(argon2::Error),

    #[error("failed to encrypt data")]
    Decrypt(chacha20poly1305::Error),
}

/// Encrypts some data using a password
pub fn encrypt(password: &[u8], input: &[u8]) -> Result<EncryptedContent, EncryptError> {
    let mut rng = OsRng;

    // Generate a random salt
    let mut salt = [0u8; 16];
    rng.fill_bytes(&mut salt);

    // Derive key from password + salt
    let mut key_bytes = [0u8; 32];
    Argon2::default()
        .hash_password_into(password, &salt, &mut key_bytes)
        .map_err(EncryptError::HashPassword)?;

    let key = Key::from_slice(&key_bytes);

    // Create cipher
    let cipher = XChaCha20Poly1305::new(key);

    // Generate nonce
    let nonce = XChaCha20Poly1305::generate_nonce(&mut rng);

    // Encrypt content
    let data = cipher
        .encrypt(&nonce, input)
        .map_err(EncryptError::Encrypt)?;

    Ok(EncryptedContent {
        salt: salt.to_vec(),
        nonce: nonce.to_vec(),
        data,
    })
}

/// Decrypt a secret using its parts
pub fn decrypt(
    password: &[u8],
    salt: &[u8],
    nonce: &[u8],
    input: &[u8],
) -> Result<Vec<u8>, DecryptError> {
    // Derive the key from the password and salt
    let mut key_bytes = [0u8; 32];
    Argon2::default()
        .hash_password_into(password, salt, &mut key_bytes)
        .map_err(DecryptError::HashPassword)?;

    let key = Key::from_slice(&key_bytes);

    // Create cipher
    let cipher = XChaCha20Poly1305::new(key);

    // Attempt decryption
    let nonce = XNonce::from_slice(nonce);

    cipher.decrypt(nonce, input).map_err(DecryptError::Decrypt)
}
