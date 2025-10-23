use crate::{
    commands::CmdResult,
    utils::{
        aws::get_aws_profiles,
        encryption::{encrypt, EncryptedContent},
    },
};

/// Check if the provided server is initialized
#[tauri::command]
pub fn utils_encrypt(password: String, input: String) -> CmdResult<EncryptedContent> {
    let output = encrypt(password.as_bytes(), input.as_bytes())?;
    Ok(output)
}

/// Load and return the available AWS profiles that can be used
#[tauri::command]
pub async fn utils_get_aws_profiles() -> CmdResult<Vec<String>> {
    let profiles = get_aws_profiles().await?;
    Ok(profiles)
}
