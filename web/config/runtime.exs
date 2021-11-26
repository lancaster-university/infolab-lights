import Config

hosts = String.split(System.get_env("HOSTS") || "http://localhost:4000")
port = String.to_integer(System.get_env("PORT") || "4000")
default_secret_key_base = :crypto.strong_rand_bytes(65) |> Base.encode64()

config :infolab_light_games, InfolabLightGamesWeb.Endpoint,
  http: [port: port, compress: true],
  url: [host: nil, port: port],
  check_origin: hosts,
  secret_key_base: System.get_env("SECRET_KEY_BASE") || default_secret_key_base

config :infolab_light_games, InfolabLightGamesWeb.Router,
  admin_pass:
    System.get_env("ADMIN_PASS") || raise("environment variable ADMIN_PASS is missing."),
  api_token: System.get_env("API_TOKEN") || raise("environment variable API_TOKEN is missing.")
