use crate::screen::Pixel;
use serde::{
    de::{self, MapAccess, Visitor},
    Deserialize, Deserializer,
};
use std::{collections::HashMap, fmt, marker::PhantomData};
use tungstenite::connect;
use url::Url;

#[derive(Deserialize)]
pub struct DiffPixel {
    pub x: u32,
    pub y: u32,
    pub old: Pixel,
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

#[derive(Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ScreenUpdate {
    Full { screen: IntKeyMap<IntKeyMap<Pixel>> },
    Diff { diff: Vec<DiffPixel> },
}

pub fn connnect_to_spout() -> tungstenite::WebSocket<tungstenite::client::AutoStream> {
    let url = std::env::var("INFOLAB_PIXEL_SPOUT").unwrap();
    let (socket, _) = connect(Url::parse(&url).unwrap()).unwrap();
    socket
}
