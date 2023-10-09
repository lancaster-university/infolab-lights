{
  description = "Dev deps for stuff";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    fenix.url = "github:nix-community/fenix";
  };

  outputs = { self, nixpkgs, flake-utils, fenix }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ fenix.overlays.default ];
        };
        rustComponents = pkgs.fenix.complete.withComponents [ "cargo" "rustc" ];
        buildPackages = with pkgs; [
            nodejs
            yarn
            rustComponents
            beam.packages.erlang.rebar3
            beam.packages.erlang.hex
            beam.packages.erlang.erlang
            beam.packages.erlang.elixir
            elixir-ls
            git
          ];
      in
      rec {
        devShells.default = pkgs.mkShell {
          buildInputs = buildPackages;
        };
      }
    );
}
