use crate::pixel::Pixel;
use base64;
use de::DeserializeOwned;
use miniz_oxide;
use serde::{
    de::{self, MapAccess, Visitor, DeserializeSeed},
    Deserialize, Deserializer,
};
use std::{collections::HashMap, fmt, marker::PhantomData};
use tungstenite::connect;
use url::Url;

#[derive(Deserialize)]
pub struct DiffPixel {
    pub x: u16,
    pub y: u16,
    pub new: Pixel,
}

fn de_intkeyed<'de, D: Deserializer<'de>, T: Deserialize<'de>>(deserializer: D) ->
    Result<HashMap<(u16, u16), T>, D::Error>
{

    struct ExtendMap<'a, T: 'a>(u16, &'a mut HashMap<(u16, u16), T>);

    impl<'de, 'a, V> DeserializeSeed<'de> for ExtendMap<'a, V>
    where
        V: Deserialize<'de>,
    {
        type Value = ();

        fn deserialize<D>(self, deserializer: D) -> Result<Self::Value, D::Error>
        where
            D: Deserializer<'de>,
        {
            struct ExtendMapVisitor<'a, T: 'a>(u16, &'a mut HashMap<(u16, u16), T>);

            impl<'de, 'a, V> Visitor<'de> for ExtendMapVisitor<'a, V>
            where
                V: Deserialize<'de>,
            {
                type Value = ();

                fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                    formatter.write_str("int keyed map")
                }

                fn visit_map<M>(self, mut access: M) -> Result<Self::Value, M::Error>
                where
                    M: MapAccess<'de>,
                {
                    while let Some((key, value)) = access.next_entry::<&str, _>()? {
                        let y = key.parse::<u16>().map_err(de::Error::custom)?;
                        self.1.insert((self.0, y), value);
                    }

                    Ok(())
                }
            }

            deserializer.deserialize_map(ExtendMapVisitor(self.0, self.1))
        }
    }

    struct IntKeyMapVisitor<T>(PhantomData<T>);

    impl<'de, V> Visitor<'de> for IntKeyMapVisitor<V>
    where
        V: Deserialize<'de>,
    {
        type Value = HashMap<(u16, u16), V>;

        fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
            formatter.write_str("int keyed map")
        }

        fn visit_map<M>(self, mut access: M) -> Result<Self::Value, M::Error>
        where
            M: MapAccess<'de>,
        {
            let mut map = HashMap::with_capacity(access.size_hint().unwrap_or(0));

            while let Some(key) = access.next_key::<&str>()? {
                let x = key.parse::<u16>().map_err(de::Error::custom)?;
                let visitor = ExtendMap(x, &mut map);
                access.next_value_seed(visitor)?;
            }

            Ok(map)
        }
    }

    deserializer.deserialize_map(IntKeyMapVisitor(PhantomData))
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
            let inflated = miniz_oxide::inflate::decompress_to_vec_zlib(&decoded)
                .map_err(|e| E::custom(DebugAsDisplay(e)))?;
            let s = std::str::from_utf8(&inflated).map_err(E::custom)?;
            serde_json::from_str(s).map_err(E::custom)
        }
    }

    deserializer.deserialize_any(CompressedJsonStringVisitor(PhantomData))
}

#[derive(Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ScreenUpdate {
    Full {
        #[serde(deserialize_with = "de_intkeyed")]
        screen: HashMap<(u16, u16), Pixel>,
    },
    Diff {
        #[serde(deserialize_with = "de_compressed")]
        diff: Vec<DiffPixel>,
    },
}

pub fn connnect_to_spout() -> tungstenite::WebSocket<tungstenite::client::AutoStream> {
    let url = std::env::var("INFOLAB_PIXEL_SPOUT").unwrap();
    let (socket, _) = connect(Url::parse(&url).unwrap()).unwrap();
    socket
}
