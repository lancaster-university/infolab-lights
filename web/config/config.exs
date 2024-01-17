# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

# Configures the endpoint
config :infolab_light_games, InfolabLightGamesWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "aoqmrXoKDZ0hZKxMlrmzIsChXjCd/IbzpRVR62Z/XMIFINd+VkI6RG9OnFa9F0Eo",
  render_errors: [view: InfolabLightGamesWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: InfolabLightGames.PubSub,
  live_view: [signing_salt: "5fq+eAsl"]

config :infolab_light_games, Screen, dims: {120, 80}

# See table in the repo README 
config :infolab_light_games, Scheduler,
  jobs: [
    {"0 17 * * FRI",
     {Utils.StaticLoader, :display_static, ["luhack.png", {Timex.Duration, :from_hours, [2]}]}},
    {"0 17 * * MON",
     {Utils.StaticLoader, :display_static, ["lgbt.gif", {Timex.Duration, :from_hours, [3]}]}},
    {"*/30 */1 * 6 *",
     {Utils.StaticLoader, :display_static, ["pride.png", {Timex.Duration, :from_minutes, [10]}]}},
    {"0 */1 9-15 10 *",
     {Utils.StaticLoader, :display_static, ["infolab-babyloss.gif", {Timex.Duration, :from_hours, [1]}]}},
    {"0 */1 22-28 1 *",
     {Utils.StaticLoader, :display_static, ["holocaust-memorial-day.png", {Timex.Duration, :from_hours, [1]}]}},
    {"0 */1 31 10 *",
     {Utils.StaticLoader, :display_static, ["halloween_pumpkin.gif", {Timex.Duration, :from_hours, [1]}]}},
    {"0 */1 5 11 *",
     {Utils.StaticLoader, :display_static, ["fire.gif", {Timex.Duration, :from_hours, [1]}]}},
    {"*/20 */1 25-26 11 *",
      {Utils.StaticLoader, :display_static, ["lanhack-anim.gif", {Timex.Duration, :from_minutes, [10]}]}},
    {"0 */1 30 11 *",
      {Utils.StaticLoader, :display_static, ["scotland.png", {Timex.Duration, :from_hours, [1]}]}},
    {"0 */1 1 3 *",
      {Utils.StaticLoader, :display_static, ["wales.png", {Timex.Duration, :from_hours, [1]}]}},
    {"0 */1 9 5 *",
      {Utils.StaticLoader, :display_static, ["eu.png", {Timex.Duration, :from_hours, [1]}]}}
  ]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

config :infolab_light_games, :phoenix_swagger,
  swagger_files: %{
    "priv/static/swagger.json" => [
      router: InfolabLightGamesWeb.Router
    ]
  }

config :phoenix_swagger, json_library: Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
