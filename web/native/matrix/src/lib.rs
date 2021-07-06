use rustler::{Env, Error, ResourceArc, Term};

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
fn set_at(mat: ResourceArc<MatrixResource>, x: usize, y: usize, val: Pixel) -> ResourceArc<MatrixResource> {
    let mut new_mat: MatrixResource = (&*mat).clone();
    new_mat.set(x, y, val);

    ResourceArc::new(new_mat)
}

#[rustler::nif]
fn set_from_list(mat: ResourceArc<MatrixResource>, tail: rustler::ListIterator) -> Result<ResourceArc<MatrixResource>, Error> {
    let mut new_mat: MatrixResource = (&*mat).clone();

    for h in tail {
        let (x, y, val): (usize, usize, _) = h.decode()?;

        new_mat.set(x, y, val);
    }

    Ok(ResourceArc::new(new_mat))
}

type Coord = (usize, usize);

#[rustler::nif]
fn draw_rect_at(mat: ResourceArc<MatrixResource>, (x0, y0): Coord, (x1, y1): Coord, val: Pixel) -> ResourceArc<MatrixResource> {

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
fn diff(mat: ResourceArc<MatrixResource>, mat2: ResourceArc<MatrixResource>) -> Result<Vec<(usize, usize, Pixel)>, Error> {
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
        mul
    ],
    load = on_load
);
