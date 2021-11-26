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
