defmodule IdleAnimations.JSImpl do
  @behaviour IdleAnimations.IdleAnimation

  use GenServer, restart: :temporary
  require Logger

  @moduledoc "Idle animations that are written in js"

  @fps 20
  # about 10 minutes at 20fps
  @max_steps 12_000
  # 10 seconds at 20fps
  @no_frame_timeout @fps * 10

  defmodule State do
    use TypedStruct

    typedstruct enforce: true do
      field(:id, String.t())
      field(:file, {Path.t(), :js | :ts})

      field(:matrix, NativeMatrix.t())
      field(:port, port() | nil, default: nil)
      field(:tmp_file, Path.t() | nil, default: nil)
      field(:working_input, iodata(), default: "")

      field(:fading_out, boolean(), default: false)
      field(:fader, Fader.t(), default: Fader.new(20))

      field(:steps, non_neg_integer(), default: 0)
      field(:steps_since_last_frame, non_neg_integer(), default: 0)
      field(:last_frame_time, non_neg_integer(), default: 0)
    end
  end

  def start_link(options) do
    {screen_x, screen_y} = Screen.dims()

    mode = Keyword.fetch!(options, :mode)

    state = %State{
      id: Keyword.fetch!(options, :game_id),
      file: mode,
      matrix: NativeMatrix.of_dims(screen_x, screen_y, Pixel.empty())
    }

    Logger.info("starting up js effect #{state.id}:#{inspect(state.file)}")

    GenServer.start_link(__MODULE__, state, options)
  end

  defp ftype(name) do
    case Path.extname(name) do
      ".js" -> :js
      ".ts" -> :ts
    end
  end

  @impl true
  def possible_modes do
    Application.app_dir(:infolab_light_games, "priv")
    |> Path.join("js_effects/*.{js,ts}")
    |> Path.wildcard()
    |> Enum.map(&{{&1, ftype(&1)}, Path.basename(&1, Path.extname(&1))})
  end

  @impl true
  def init(%State{} = state) do
    tick_request()

    Temp.track!()

    {:ok, state, {:continue, :start}}
  end

  @impl true
  def handle_continue(:start, %State{file: {src_file, :ts}} = state) do
    deno = System.find_executable("deno")
    {tmp, path} = Temp.open!(%{suffix: ".ts"})
    {screen_x, screen_y} = Screen.dims()

    src = File.read!(src_file)

    content = """
    import { writeAllSync } from "https://deno.land/std@0.113.0/streams/conversion.ts";
    import { pack } from 'https://deno.land/x/msgpackr@v1.3.2/index.js';

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

    class Display {
      #buffer: Array<Array<[number, number, number]>>;
      width: number;
      height: number;

      constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.#buffer = Array.from(Array(width), () => Array.from(Array(height), () => [0, 0, 0]));
      }

      setPixel(x: number, y: number, [r, g, b]: [number, number, number]) {
        this.#buffer[x][y] = [r, g, b];
      }

      flush() {
        const pixels = this.#buffer.flatMap((col, x) => {
          return col.map(([r, g, b], y) => ({x: x | 0, y: y | 0, v: [r | 0, g | 0, b | 0]}));
        });

        const chunkSize = 1000;
        const len = pixels.length;
        for (let i = 0; i < len; i += chunkSize) {
          writeAllSync(Deno.stdout, pack(pixels.slice(i, i + chunkSize)));
        }
      }
    }

    namespace Effect {
      #{src}
    }

    const effect = Object.values(Effect)[0];

    interface EffectInterface {
      update(): null;
    }

    interface EffectConstructor {
      new (display: Display): EffectInterface;
    }

    const inst = new (effect as unknown as EffectConstructor)(new Display(#{screen_x}, #{screen_y}));

    while (true) {
        let r = new TextDecoder().decode(await readStdin())
        let {msg: msg} = JSON.parse(r.trim());

        // msg should always be "tick"

        inst.update();
    }

    """

    IO.write(tmp, content)
    File.close(tmp)

    port =
      Port.open(
        {:spawn_executable, deno},
        [:binary, :stream, :use_stdio, args: ["run", "--allow-net", "-q", path]]
      )

    state = %State{state | port: port, tmp_file: path}

    {:noreply, state}
  end

  @impl true
  def handle_continue(:start, %State{file: {src_file, :js}} = state) do
    deno = System.find_executable("deno")
    {tmp, path} = Temp.open!(%{suffix: ".js"})
    {screen_x, screen_y} = Screen.dims()

    src = File.read!(src_file)

    content = """
    import { writeAllSync } from "https://deno.land/std@0.113.0/streams/conversion.ts";
    import { pack } from 'https://deno.land/x/msgpackr@v1.3.2/index.js';

    console.log = console.trace;
    console.debug = console.trace;
    console.info = console.trace;

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

    class Display {
      #buffer;

      constructor(width, height) {
        this.width = width;
        this.height = height;

        this.#buffer = Array.from(Array(width), () => Array.from(Array(height), () => [0, 0, 0]));
      }

      setPixel(x, y, [r, g, b]) {
        this.#buffer[x][y] = [r, g, b];
      }

      flush() {
        const pixels = this.#buffer.flatMap((col, x) => {
          return col.map(([r, g, b], y) => ({x: x | 0, y: y | 0, v: [r | 0, g | 0, b | 0]}));
        });

        const chunkSize = 1000;
        const len = pixels.length;
        for (let i = 0; i < len; i += chunkSize) {
          writeAllSync(Deno.stdout, pack(pixels.slice(i, i + chunkSize)));
        }
      }
    }

    const effect = (() => {
        #{src}
    })();

    const inst = new effect(new Display(#{screen_x}, #{screen_y}));

    while (true) {
        let r = new TextDecoder().decode(await readStdin()).trim();
        if (!r) {
          console.log("Empty string received, quitting");
          break;
        }
        let {msg: msg} = JSON.parse(r);

        // msg should always be "tick"

        inst.update();
    }

    """

    IO.write(tmp, content)
    File.close(tmp)

    port =
      Port.open(
        {:spawn_executable, deno},
        [:binary, :stream, :use_stdio, args: ["run", "--allow-net", "-q", path]]
      )

    state = %State{state | port: port, tmp_file: path}

    {:noreply, state}
  end

  @impl true
  def handle_info(:tick, %State{} = state) do
    render(state)

    # don't have tons of in-flight frame requests
    time_since_last_frame = System.monotonic_time(:millisecond) - state.last_frame_time

    if state.steps_since_last_frame < 6 or time_since_last_frame > 500 do
      cmd = Jason.encode!(%{msg: :tick})
      send(state.port, {self(), {:command, "#{cmd}\n"}})
    end

    state = %State{
      state
      | steps: state.steps + 1,
        fader: Fader.step(state.fader),
        steps_since_last_frame: state.steps_since_last_frame + 1
    }

    frame_timeout_reached = state.steps_since_last_frame > @no_frame_timeout

    if not frame_timeout_reached and state.steps < @max_steps and
         not (state.fading_out and Fader.done(state.fader)) do
      tick_request()

      {:noreply, state}
    else
      if frame_timeout_reached do
        Logger.info("Terminating animation because it didn't produce frames: #{state.id}:#{inspect(state.file)}")
      end

      # trigger the fade out
      {:stop, :normal, state}
    end
  end

  @impl true
  def handle_info({port, {:data, msg}}, %State{port: port, working_input: working_input} = state) do
    state = process_input([working_input, msg], state)

    {:noreply, state}
  end

  @impl true
  def handle_info({port, :closed}, %State{port: port} = state) do
    Logger.info("Js effect exited")

    {:noreply, start_fading_out(state)}
  end

  @impl true
  def handle_cast(:terminate, %State{} = state) do
    Logger.info("Forcing js effect termination")

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

  defp fix_int(num) do
    max(min(trunc(num), 255), 0)
  end

  defp process_input(msg, %State{} = state) do
    {screen_x, screen_y} = Screen.dims()

    case Msgpax.unpack_slice(msg) do
      {:ok, parsed, rest} ->
        pixels =
          parsed
          |> Enum.map(fn %{"x" => x, "y" => y, "v" => [r, g, b]} ->
            {x, y, {fix_int(r), fix_int(g), fix_int(b)}}
          end)
          |> Enum.filter(fn {x, y, _} ->
            x >= 0 and x < screen_x and y >= 0 and y < screen_y
          end)

        state = %State{
          state
          | steps_since_last_frame: 0,
            last_frame_time: System.monotonic_time(:millisecond),
            matrix: NativeMatrix.set_from_list(state.matrix, pixels)
        }

        process_input(rest, state)

      {:error, _e} ->
        %State{state | working_input: msg}
    end
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
