use crate::incoming::{IntKeyMap, DiffPixel};
use deku::prelude::*;
use ndarray;
use serde::Deserialize;

#[derive(Debug, Deserialize, Copy, Clone, PartialOrd, PartialEq, DekuWrite)]
pub struct Pixel {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl std::ops::Add for Pixel {
    type Output = Self;

    fn add(self, rhs: Self) -> Self::Output {
        Pixel {
            r: self.r + rhs.r,
            g: self.g + rhs.g,
            b: self.b + rhs.b,
        }
    }
}

impl num_traits::Zero for Pixel {
    fn zero() -> Self {
        Pixel { r: 0, g: 0, b: 0 }
    }

    fn is_zero(&self) -> bool {
        *self == Self::zero()
    }
}

pub struct Screen(pub ndarray::Array2<Pixel>);

impl Screen {
    pub fn from_full(full: IntKeyMap<IntKeyMap<Pixel>>) -> Screen {
        let max_x = full.0.keys().max().cloned().unwrap() as usize + 1;
        let max_y = full.0.values().next().unwrap().0.keys().max().cloned().unwrap() as usize + 1;

        let mut arr = ndarray::Array2::zeros((max_x, max_y));

        for (x, col) in full.0 {
            for (y, pix) in col.0 {
                arr[[x as usize, y as usize]] = pix;
            }
        }

        Screen(arr)
    }


    pub fn update_with_diff(&mut self, diff: Vec<DiffPixel>) {
        for pix in diff {
            self.0[[pix.x as usize, pix.y as usize]] = pix.new;
        }
    }

    pub fn get(&self, x: u16, y: u16) -> Pixel {
        self.0[[x as usize, y as usize]]
    }
}
