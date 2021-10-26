use crate::pixel::Pixel;
use de::DeserializeOwned;
use serde::{
    de::{self, Visitor},
    Deserialize, Deserializer,
};
use std::{error::Error, fmt, marker::PhantomData, net::TcpStream};
use tungstenite::{WebSocket, connect, stream::MaybeTlsStream};
use url::Url;

#[derive(Deserialize)]
pub struct DiffPixel {
    pub x: u16,
    pub y: u16,
    pub new: Pixel,
}

struct DebugAsDisplay<T>(T);

impl<T: fmt::Debug> fmt::Debug for DebugAsDisplay<T> {
    fn fmt(&self, f: &mut fmt::Formatter) -> Result<(), fmt::Error> {
        self.0.fmt(f)
    }
}

impl<T: fmt::Debug> fmt::Display for DebugAsDisplay<T> {
    fn fmt(&self, f: &mut fmt::Formatter) -> Result<(), fmt::Error> {
        self.0.fmt(f)
    }
}

fn de_compressed<'de, D: Deserializer<'de>, T: DeserializeOwned>(
    deserializer: D,
) -> Result<T, D::Error> {
    struct MsgPackVisitor<T>(PhantomData<T>);

    impl<'de, T: DeserializeOwned> Visitor<'de> for MsgPackVisitor<T> {
        type Value = T;

        fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
            formatter.write_str("a string containing base64 encoded, compressed, json data")
        }

        fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
        where
            E: de::Error,
        {
            let decoded = base64::decode(v).map_err(E::custom)?;
            rmp_serde::from_read(decoded.as_slice()).map_err(E::custom)
        }
    }

    deserializer.deserialize_any(MsgPackVisitor(PhantomData))
}

#[derive(Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ScreenUpdate {
    Diff {
        #[serde(deserialize_with = "de_compressed")]
        diff: Vec<DiffPixel>,
    },
}

pub fn connnect_to_spout(url: &Url) -> Result<WebSocket<MaybeTlsStream<TcpStream>>, Box<dyn Error>> {
    let (socket, _) = connect(url)?;
    Ok(socket)
}
