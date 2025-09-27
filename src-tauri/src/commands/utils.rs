use crate::{
    commands::CmdResult,
    utils::encryption::{encrypt, EncryptedContent},
};

/// Check if the provided server is initialized
#[tauri::command]
pub fn utils_encrypt(password: String, input: String) -> CmdResult<EncryptedContent> {
    let output = encrypt(password.as_bytes(), input.as_bytes())?;
    Ok(output)
}
