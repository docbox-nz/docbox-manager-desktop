use eyre::Context;

/// Load and return the available AWS profiles that can be used
pub async fn get_aws_profiles() -> eyre::Result<Vec<String>> {
    let fs = aws_types::os_shim_internal::Fs::real();
    let env = aws_types::os_shim_internal::Env::real();
    let profile_files = aws_runtime::env_config::file::EnvConfigFiles::default();
    let profiles_set = aws_config::profile::load(&fs, &env, &profile_files, None)
        .await
        .context("failed to load profiles set")?;

    let section_names: Vec<String> = profiles_set
        .profiles()
        .map(|value| value.to_string())
        .collect();

    Ok(section_names)
}
