defmodule InfolabLightGames.MixProject do
  use Mix.Project

  def project do
    [
      app: :infolab_light_games,
      version: "0.1.0",
      elixir: "~> 1.12",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: [:phoenix] ++ Mix.compilers(),
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
      extra_applications: [:logger, :runtime_tools, :os_mon]
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
      {:phoenix_html, "~> 3.0.4"},
      {:phoenix_live_reload, "~> 1.3", only: :dev},
      {:phoenix_live_view, "~> 0.16.4"},
      {:phoenix_live_dashboard, "~> 0.5"},
      {:telemetry_metrics, "~> 0.6.1"},
      {:telemetry_poller, "~> 1.0"},
      {:jason, "~> 1.2"},
      {:plug_cowboy, "~> 2.4"},
      {:typed_struct, "~> 0.2"},
      {:qex, "~> 0.5"},
      {:ok, "~> 2.3"},
      {:rustler, "~> 0.22"},
      {:remote_ip, "~> 1.0"},
      {:tint, "~> 1.1"},
      {:credo, "~> 1.5", only: [:dev, :test], runtime: false}
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
      setup: ["deps.get", "cmd npm install --prefix assets"],
      "assets.deploy": ["cmd npm run deploy --prefix assets", "phx.digest"]
    ]
  end
end
