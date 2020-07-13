use Mix.Config

host = System.get_env("HOST") || "localhost"
port = String.to_integer(System.get_env("PORT") || "4000")
default_secret_key_base = :crypto.strong_rand_bytes(43) |> Base.encode64

config :infolab_light_games, InfolabLightGamesWeb.Endpoint,
  http: [port: port, compress: true],
  url: [host: host, port: port],
  secret_key_base: System.get_env("SECRET_KEY_BASE") || default_secret_key_base

config :infolab_light_games, InfolabLightGamesWeb.Router,
  admin_pass: System.get_env("ADMIN_PASS")
