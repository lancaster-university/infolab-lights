use std::num::Wrapping;

use zerocopy::AsBytes;

#[derive(Debug, Copy, Clone, PartialOrd, PartialEq, AsBytes)]
#[repr(packed)]
pub struct Pixel {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl Pixel {
    pub fn wrapping_sum(&self) -> Wrapping<u8> {
        Wrapping(self.r) + Wrapping(self.g) + Wrapping(self.b)
    }
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
