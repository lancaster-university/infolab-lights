use crate::screen::Pixel;
use serde::{
    de::{self, MapAccess, Visitor},
    Deserialize, Deserializer,
};
use std::{collections::HashMap, fmt, marker::PhantomData};
use tungstenite::connect;
use url::Url;
use base64;
use miniz_oxide;
use de::DeserializeOwned;

#[derive(Deserialize)]
pub struct DiffPixel {
    pub x: u32,
    pub y: u32,
    pub new: Pixel,
}

#[derive(Debug)]
pub struct IntKeyMap<V>(pub HashMap<u16, V>);

struct IntKeyMapVisitor<V> {
    marker: PhantomData<fn() -> IntKeyMap<V>>,
}

impl<V> IntKeyMapVisitor<V> {
    fn new() -> Self {
        Self {
            marker: PhantomData,
        }
    }
}

impl<'de, V> Visitor<'de> for IntKeyMapVisitor<V>
where
    V: Deserialize<'de>,
{
    type Value = IntKeyMap<V>;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("int keyed map")
    }

    fn visit_map<M>(self, mut access: M) -> Result<Self::Value, M::Error>
    where
        M: MapAccess<'de>,
    {
        let mut map = HashMap::with_capacity(access.size_hint().unwrap_or(0));

        while let Some((key, value)) = access.next_entry::<String, _>()? {
            map.insert(key.parse::<u16>().map_err(de::Error::custom)?, value);
        }

        Ok(IntKeyMap(map))
    }
}

impl<'de, V> Deserialize<'de> for IntKeyMap<V>
where
    V: Deserialize<'de>,
{
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserializer.deserialize_map(IntKeyMapVisitor::new())
    }
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

fn de_compressed<'de, D: Deserializer<'de>, T: DeserializeOwned>(deserializer: D) -> Result<T, D::Error> {
    struct CompressedJsonStringVisitor<T>(PhantomData<T>);

    impl<'de, T: DeserializeOwned> Visitor<'de> for CompressedJsonStringVisitor<T> {
        type Value = T;

        fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
            formatter.write_str("a string containing base64 encoded, compressed, json data")
        }

        fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
        where
            E: de::Error,
        {
            let decoded = base64::decode(v).map_err(E::custom)?;
            let inflated = miniz_oxide::inflate::decompress_to_vec_zlib(&decoded).map_err(|e| E::custom(DebugAsDisplay(e)))?;
            let s = std::str::from_utf8(&inflated).map_err(E::custom)?;
            serde_json::from_str(s).map_err(E::custom)
        }
    }

    deserializer.deserialize_any(CompressedJsonStringVisitor(PhantomData))
}

#[derive(Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ScreenUpdate {
    Full { screen: IntKeyMap<IntKeyMap<Pixel>> },
    Diff {
        #[serde(deserialize_with = "de_compressed")]
        diff: Vec<DiffPixel>
    },
}

pub fn connnect_to_spout() -> tungstenite::WebSocket<tungstenite::client::AutoStream> {
    let url = std::env::var("INFOLAB_PIXEL_SPOUT").unwrap();
    let (socket, _) = connect(Url::parse(&url).unwrap()).unwrap();
    socket
}
