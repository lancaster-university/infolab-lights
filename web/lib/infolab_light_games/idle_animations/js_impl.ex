defmodule IdleAnimations.JSImpl do
  use GenServer, restart: :transient

  @moduledoc "Idle animations that are written in js"

  @fps 20
  @max_steps 3_000 # about 2.5 minutes at 20fps

  defmodule State do
    use TypedStruct

    typedstruct enforce: true do
      field(:id, String.t())
      field(:file, Path.t())

      field(:matrix, NativeMatrix.t())
      field(:port, port() | nil, default: nil)
      field(:tmp_file, Path.t() | nil, default: nil)

      field(:fading_out, boolean(), default: false)
      field(:fader, Fader.t(), default: Fader.new(20))

      field(:steps, non_neg_integer(), default: 0)
    end
  end

  def start_link(options) do
    {screen_x, screen_y} = Screen.dims()

    state = %State{
      id: Keyword.fetch!(options, :game_id),
      file: get_random_effect(),
      matrix: NativeMatrix.of_dims(screen_x, screen_y, Pixel.empty())
    }

    IO.inspect("starting up js effect #{state.file}")

    GenServer.start_link(__MODULE__, state, options)
  end

  def get_random_effect() do
    Application.app_dir(:infolab_light_games, "priv")
    |> Path.join("js_effects/*.js")
    |> Path.wildcard()
    |> Enum.random()
  end

  @impl true
  def init(state) do
    tick_request()

    {:ok, state, {:continue, :start_js}}
  end

  @impl true
  def handle_continue(:start_js, %State{file: src_file} = state) do
    deno = System.find_executable("deno")
    {tmp, path} = Temp.open!(%{suffix: ".js"})
    {screen_x, screen_y} = Screen.dims()

    src = File.read!(src_file)

    content = """
    import { writeAllSync } from "https://deno.land/std@0.113.0/streams/conversion.ts";

    async function readStdin() {
        const bytes = [];

        while (true) {
            const buffer = new Uint8Array(1);
            const readStatus = await Deno.stdin.read(buffer);

            if (readStatus === null || readStatus === 0) {
                break;
            }

            const byte = buffer[0];

            if (byte === 10) {
                break;
            }

            bytes.push(byte);
        }

        return Uint8Array.from(bytes);
    }

    function set_pixel(x, y, [r, g, b]) {
        writeAllSync(Deno.stdout, new TextEncoder().encode(JSON.stringify({x: x, y: y, v: [r, g, b]}) + "\\n"));
    }

    const effect = (
        #{src}
    );

    const inst = new effect(set_pixel, #{screen_x}, #{screen_y});

    while (true) {
        let {msg: msg} = await readStdin();

        // msg should always be "tick"

        inst.update();
    }

    """

    IO.write(tmp, content)
    File.close(tmp)

    port =
      Port.open(
        {:spawn_executable, deno},
        [:binary, :stream, :use_stdio, args: ["run", "-q", path]]
      )

    state = %State{state | port: port, tmp_file: path}

    {:noreply, state}
  end

  @impl true
  def handle_info(:tick, %State{} = state) do
    render(state)
    cmd = Jason.encode!(%{msg: :tick})
    send(state.port, {self(), {:command, "#{cmd}\n"}})

    state = %State{state | steps: state.steps + 1, fader: Fader.step(state.fader)}

    if state.steps < @max_steps and not (state.fading_out and Fader.done(state.fader)) do
      tick_request()

      {:noreply, state}
    else
      {:stop, :normal, state}
    end
  end

  @impl true
  def handle_info({port, {:data, msg}}, %State{port: port} = state) do
    state =
      for line <- String.split(String.trim(msg), ~r/\R/), reduce: state do
        state ->
          %{"x" => x, "y" => y, "v" => [r, g, b]} = Jason.decode!(line)

          %State{
            state
            | matrix: NativeMatrix.set_at(state.matrix, x, y, {trunc(r), trunc(g), trunc(b)})
          }
      end

    {:noreply, state}
  end

  @impl true
  def handle_info({port, :closed}, %State{port: port} = state) do
    {:noreply, start_fading_out(state)}
  end

  @impl true
  def handle_cast(:terminate, %State{} = state) do
    case state.port do
      nil -> nil
      port -> send(port, {self(), :close})
    end

    {:noreply, start_fading_out(state)}
  end

  @impl true
  def terminate(_reason, %State{} = state) do
    case state.port do
      nil -> nil
      port -> send(port, {self(), :close})
    end

    Coordinator.notify_idle_animation_terminated(state.id)
  end

  defp start_fading_out(%State{} = state) do
    %State{state | fading_out: true, fader: %Fader{state.fader | direction: :dec}}
  end

  defp tick_request do
    Process.send_after(self(), :tick, Integer.floor_div(1000, @fps))
  end

  defp render(%State{} = state) do
    frame = NativeMatrix.mul(state.matrix, Fader.percentage(state.fader))

    Screen.update_frame(frame)
  end
end
