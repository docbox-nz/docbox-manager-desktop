use serde::Serialize;

pub mod root;
pub mod server;
pub mod tenant;

type CmdResult<T> = Result<T, CmdError>;

pub struct CmdError(eyre::Error);

impl Serialize for CmdError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&format!("{:?}", self.0))
    }
}

impl<E> From<E> for CmdError
where
    E: Into<eyre::Report>,
{
    fn from(value: E) -> Self {
        CmdError(value.into())
    }
}
