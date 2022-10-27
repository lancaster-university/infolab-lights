use std::time::Duration;

use image::{
    AnimationDecoder, DynamicImage, EncodableLayout, ImageEncoder, ImageFormat, Rgb, RgbImage,
};
use rustler::{Binary, Env, Error, OwnedBinary, ResourceArc, Term};

mod atoms {
    rustler::atoms! {
        ok,
    }
}

#[derive(Clone)]
struct MatrixResource {
    width: usize,
    height: usize,
    vals: Box<[(u8, u8, u8)]>,
}

impl MatrixResource {
    fn get(&self, x: usize, y: usize) -> (u8, u8, u8) {
        self.vals[y * self.width + x]
    }

    fn set(&mut self, x: usize, y: usize, val: (u8, u8, u8)) {
        self.vals[y * self.width + x] = val;
    }
}

fn on_load(env: Env, _info: Term) -> bool {
    rustler::resource!(MatrixResource, env);
    true
}

type Pixel = (u8, u8, u8);

#[rustler::nif]
fn of_dims(width: usize, height: usize, of: Pixel) -> ResourceArc<MatrixResource> {
    let vals = vec![of; width * height].into_boxed_slice();

    ResourceArc::new(MatrixResource {
        width,
        height,
        vals,
    })
}

#[rustler::nif]
fn set_at(
    mat: ResourceArc<MatrixResource>,
    x: usize,
    y: usize,
    val: Pixel,
) -> ResourceArc<MatrixResource> {
    let mut new_mat: MatrixResource = (&*mat).clone();
    new_mat.set(x, y, val);

    ResourceArc::new(new_mat)
}

#[rustler::nif]
fn set_from_list(
    mat: ResourceArc<MatrixResource>,
    tail: rustler::ListIterator,
) -> Result<ResourceArc<MatrixResource>, Error> {
    let mut new_mat: MatrixResource = (&*mat).clone();

    for h in tail {
        let (x, y, val): (usize, usize, _) = h.decode()?;

        new_mat.set(x, y, val);
    }

    Ok(ResourceArc::new(new_mat))
}

type Coord = (usize, usize);

#[rustler::nif]
fn draw_rect_at(
    mat: ResourceArc<MatrixResource>,
    (x0, y0): Coord,
    (x1, y1): Coord,
    val: Pixel,
) -> ResourceArc<MatrixResource> {
    let mut new_mat: MatrixResource = (&*mat).clone();

    for y in y0..y1 {
        for x in x0..x1 {
            new_mat.set(x, y, val);
        }
    }

    ResourceArc::new(new_mat)
}

#[rustler::nif]
fn get_at(mat: ResourceArc<MatrixResource>, x: usize, y: usize) -> Pixel {
    mat.get(x, y)
}

#[rustler::nif]
fn diff(
    mat: ResourceArc<MatrixResource>,
    mat2: ResourceArc<MatrixResource>,
) -> Result<Vec<(usize, usize, Pixel)>, Error> {
    if mat.width != mat2.width || mat.height != mat2.height {
        return Err(Error::Atom("differing_sizes"));
    }

    let mut diffs = vec![];

    for y in 0..mat.height {
        for x in 0..mat.width {
            let a = mat.get(x, y);
            let b = mat2.get(x, y);

            if a != b {
                diffs.push((x, y, b))
            }
        }
    }

    Ok(diffs)
}

#[rustler::nif]
fn as_pairs(mat: ResourceArc<MatrixResource>) -> Vec<(usize, usize, Pixel)> {
    let mut out = vec![];

    for y in 0..mat.height {
        for x in 0..mat.width {
            let v = mat.get(x, y);
            out.push((x, y, v));
        }
    }

    out
}

#[rustler::nif]
fn mul(mat: ResourceArc<MatrixResource>, by: f64) -> ResourceArc<MatrixResource> {
    let mut new_mat: MatrixResource = (&*mat).clone();

    for y in 0..mat.height {
        for x in 0..mat.width {
            let (a, b, c) = new_mat.get(x, y);
            new_mat.set(
                x,
                y,
                (
                    (a as f64 * by) as u8,
                    (b as f64 * by) as u8,
                    (c as f64 * by) as u8,
                ),
            );
        }
    }

    ResourceArc::new(new_mat)
}

fn process_frame(img: RgbImage, width: usize, height: usize) -> ResourceArc<MatrixResource> {
    let img = image::imageops::resize(
        &img,
        width as u32,
        height as u32,
        image::imageops::FilterType::Lanczos3,
    );

    let vals = vec![(0, 0, 0); width * height].into_boxed_slice();
    let mut mat = MatrixResource {
        width,
        height,
        vals,
    };

    for (x, y, p) in img.enumerate_pixels() {
        mat.set(x as usize, y as usize, (p.0[0], p.0[1], p.0[2]));
    }

    ResourceArc::new(mat)
}

#[rustler::nif]
fn load_from_image<'a>(
    binary: Binary<'a>,
    width: usize,
    height: usize,
) -> Result<Vec<(f32, ResourceArc<MatrixResource>)>, Error> {
    if image::guess_format(binary.as_bytes()).map_err(|e| Error::Term(Box::new(e.to_string())))?
        == ImageFormat::Gif
    {
        let decoder = image::codecs::gif::GifDecoder::new(binary.as_bytes())
            .map_err(|e| Error::Term(Box::new(e.to_string())))?;

        let mut out = vec![];

        for frame in decoder.into_frames() {
            let frame = frame.map_err(|e| Error::Term(Box::new(e.to_string())))?;

            let delay: Duration = frame.delay().into();

            let mat = process_frame(
                DynamicImage::ImageRgba8(frame.into_buffer()).to_rgb8(),
                width,
                height,
            );

            out.push((delay.as_millis() as f32, mat))
        }

        Ok(out)
    } else {
        let img = image::load_from_memory(binary.as_bytes())
            .map_err(|e| Error::Term(Box::new(e.to_string())))?
            .into_rgb8();

        let mat = process_frame(img, width, height);

        Ok(vec![(9999999.0, mat)])
    }
}

#[rustler::nif]
fn to_png(mat: ResourceArc<MatrixResource>) -> Result<OwnedBinary, Error> {
    let mut image = RgbImage::new(mat.width as u32, mat.height as u32);

    for y in 0..mat.height {
        for x in 0..mat.width {
            let (r, g, b) = mat.get(x, y);
            image.put_pixel(x as u32, y as u32, Rgb([r, g, b]));
        }
    }

    let mut bytes = Vec::new();

    image::codecs::png::PngEncoder::new_with_quality(
        &mut bytes,
        image::codecs::png::CompressionType::Default,
        image::codecs::png::FilterType::Paeth,
    )
    .write_image(
        image.as_bytes(),
        image.width(),
        image.height(),
        image::ColorType::Rgb8,
    )
    .map_err(|e| Error::Term(Box::new(e.to_string())))?;

    let mut binary = OwnedBinary::new(bytes.len()).ok_or(Error::Atom("allocation_failure"))?;

    binary.as_mut_slice().copy_from_slice(&bytes);

    Ok(binary)
}

#[rustler::nif]
fn pow(mat: ResourceArc<MatrixResource>, p: f64) -> ResourceArc<MatrixResource> {
    let mut new_mat: MatrixResource = (&*mat).clone();

    for y in 0..mat.height {
        for x in 0..mat.width {
            let (a, b, c) = new_mat.get(x, y);
            new_mat.set(
                x,
                y,
                (
                    ((a as f64 / 255.0).powf(p) * 255.0) as u8,
                    ((b as f64 / 255.0).powf(p) * 255.0) as u8,
                    ((c as f64 / 255.0).powf(p) * 255.0) as u8,
                ),
            );
        }
    }

    ResourceArc::new(new_mat)
}

rustler::init!(
    "Elixir.NativeMatrix.NifBridge",
    [
        of_dims,
        set_at,
        set_from_list,
        get_at,
        draw_rect_at,
        diff,
        as_pairs,
        mul,
        load_from_image,
        to_png,
        pow
    ],
    load = on_load
);
