defmodule InfolabLightGames.MixProject do
  use Mix.Project

  def project do
    [
      app: :infolab_light_games,
      version: "0.1.0",
      elixir: "~> 1.12",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: [:phoenix] ++ Mix.compilers() ++ [:phoenix_swagger],
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps()
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {InfolabLightGames.Application, []},
      extra_applications: [:logger, :runtime_tools, :os_mon, :ex_json_schema]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.6"},
      # {:phoenix, git: "https://github.com/phoenixframework/phoenix", override: true},
      {:floki, ">= 0.0.0", only: :test},
      {:phoenix_html, "~> 3.1"},
      {:phoenix_live_reload, "~> 1.3", only: :dev},
      {:phoenix_live_view, "~> 0.18"},
      {:phoenix_live_dashboard, "~> 0.7"},
      {:telemetry_metrics, "~> 0.6.1"},
      {:telemetry_poller, "~> 1.0"},
      {:circular_buffer, "~> 0.4"},
      {:jason, "~> 1.4"},
      {:plug_cowboy, "~> 2.4"},
      {:typed_struct, "~> 0.3"},
      {:qex, "~> 0.5"},
      {:ok, "~> 2.3"},
      {:rustler, "~> 0.26"},
      {:remote_ip, "~> 1.0"},
      {:tint, "~> 1.1"},
      {:temp, "~> 0.4"},
      {:msgpax, "~> 2.0"},
      # {:phoenix_swagger, "~> 0.8"},
      {:phoenix_swagger, git: "https://github.com/fastjames/phoenix_swagger", branch: "update_deps"},
      {:ex_json_schema, "~> 0.9.2"},
      {:credo, "~> 1.6", only: [:dev, :test], runtime: false},
      {:dialyxir, "~> 1.1.0", only: [:dev], runtime: false}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to install project dependencies and perform other setup tasks, run:
  #
  #     $ mix setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      setup: ["deps.get", "cmd --cwd assets yarn install"],
      "assets.deploy": ["cmd yarn --cwd assets run deploy", "phx.digest"]
    ]
  end
end
