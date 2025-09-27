use serde::Serialize;

pub mod root;
pub mod server;
pub mod tenant;
pub mod utils;

type CmdResult<T> = Result<T, CmdError>;

/// Error output from a handler
#[derive(Debug, Serialize)]
pub struct CmdError {
    message: String,
    code: Option<String>,
}

impl CmdError {
    pub fn coded<E: Into<eyre::Report>>(error: E, code: impl Into<String>) -> Self {
        let error: eyre::Report = error.into();
        CmdError {
            message: error.to_string(),
            code: Some(code.into()),
        }
    }
}

impl<E> From<E> for CmdError
where
    E: Into<eyre::Report>,
{
    fn from(value: E) -> Self {
        let error: eyre::Report = value.into();
        CmdError {
            message: format!("{error:?}"),
            code: None,
        }
    }
}
