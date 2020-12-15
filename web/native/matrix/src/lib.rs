use rustler::{resource_struct_init, Encoder, Env, Error, ResourceArc, Term};

mod atoms {
    rustler::rustler_atoms! {
        atom ok;
        //atom error;
        //atom __true__ = "true";
        //atom __false__ = "false";
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
    resource_struct_init!(MatrixResource, env);
    true
}

rustler::rustler_export_nifs! {
    "Elixir.NativeMatrix.NifBridge",
    [
        ("of_dims", 3, of_dims),
        ("set_at", 4, set_at),
        ("set_from_list", 2, set_from_list),
        ("get_at", 3, get_at),
        ("draw_rect_at", 4, draw_rect_at),
        ("diff", 2, diff),
        ("as_pairs", 1, as_pairs),
        ("mul", 2, mul),
    ],
    Some(on_load)
}

fn of_dims<'a>(env: Env<'a>, args: &[Term<'a>]) -> Result<Term<'a>, Error> {
    let width: usize = args[0].decode()?;
    let height: usize = args[1].decode()?;
    let of: (u8, u8, u8) = args[2].decode()?;

    let vals = vec![of; width * height].into_boxed_slice();

    let resource = ResourceArc::new(MatrixResource {
        width,
        height,
        vals,
    });

    Ok(resource.encode(env))
}

fn set_at<'a>(env: Env<'a>, args: &[Term<'a>]) -> Result<Term<'a>, Error> {
    let mat: ResourceArc<MatrixResource> = args[0].decode()?;
    let x: usize = args[1].decode()?;
    let y: usize = args[2].decode()?;
    let val: (u8, u8, u8) = args[3].decode()?;

    let mut new_mat: MatrixResource = (&*mat).clone();
    new_mat.set(x, y, val);

    let resource = ResourceArc::new(new_mat);
    Ok(resource.encode(env))
}

fn set_from_list<'a>(env: Env<'a>, args: &[Term<'a>]) -> Result<Term<'a>, Error> {
    let mat: ResourceArc<MatrixResource> = args[0].decode()?;

    let mut new_mat: MatrixResource = (&*mat).clone();

    let mut tail = args[1];

    loop {
        let (h, n_t) = tail.list_get_cell()?;

        let (x, y, val): (usize, usize, _) = h.decode()?;

        new_mat.set(x, y, val);

        tail = n_t;

        if tail.is_empty_list() {
            break;
        }
    }

    let resource = ResourceArc::new(new_mat);
    Ok(resource.encode(env))
}

fn draw_rect_at<'a>(env: Env<'a>, args: &[Term<'a>]) -> Result<Term<'a>, Error> {
    let mat: ResourceArc<MatrixResource> = args[0].decode()?;
    let (x0, y0): (usize, usize) = args[1].decode()?;
    let (x1, y1): (usize, usize) = args[2].decode()?;
    let val: (u8, u8, u8) = args[3].decode()?;

    let mut new_mat: MatrixResource = (&*mat).clone();

    for y in y0..y1 {
        for x in x0..x1 {
            new_mat.set(x, y, val);
        }
    }

    let resource = ResourceArc::new(new_mat);
    Ok(resource.encode(env))
}

fn get_at<'a>(env: Env<'a>, args: &[Term<'a>]) -> Result<Term<'a>, Error> {
    let mat: ResourceArc<MatrixResource> = args[0].decode()?;
    let x: usize = args[1].decode()?;
    let y: usize = args[2].decode()?;

    let val = mat.get(x, y);

    Ok(val.encode(env))
}

fn diff<'a>(env: Env<'a>, args: &[Term<'a>]) -> Result<Term<'a>, Error> {
    let mat: ResourceArc<MatrixResource> = args[0].decode()?;
    let mat2: ResourceArc<MatrixResource> = args[1].decode()?;

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

    Ok(diffs.encode(env))
}

fn as_pairs<'a>(env: Env<'a>, args: &[Term<'a>]) -> Result<Term<'a>, Error> {
    let mat: ResourceArc<MatrixResource> = args[0].decode()?;

    let mut out = vec![];

    for y in 0..mat.height {
        for x in 0..mat.width {
            let v = mat.get(x, y);
            out.push((x, y, v));
        }
    }

    Ok(out.encode(env))
}

fn mul<'a>(env: Env<'a>, args: &[Term<'a>]) -> Result<Term<'a>, Error> {
    let mat: ResourceArc<MatrixResource> = args[0].decode()?;
    let by: f64 = args[1].decode()?;

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

    let resource = ResourceArc::new(new_mat);
    Ok(resource.encode(env))
}
