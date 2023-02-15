defmodule Utils.StaticLoader do
  def display_static(filename, duration_fn) do
    {width, height} = Screen.dims()
    {duration_fn_m, duration_fn_n, duration_fn_a} = duration_fn
    duration = apply(duration_fn_m, duration_fn_n, duration_fn_a)

    filepath =
      Application.app_dir(:infolab_light_games, "priv")
      |> Path.join("static_images/#{filename}")

    img = File.read!(filepath)
    images = NativeMatrix.load_from_image(img, width, height)

    id = Coordinator.queue_game(Games.Static, nil, images: images)

    :timer.apply_after(
      duration |> Timex.Duration.to_milliseconds(truncate: true),
      Coordinator,
      :terminate_game,
      [id]
    )
  end
end
