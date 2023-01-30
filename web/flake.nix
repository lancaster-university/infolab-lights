{
  description = "Dev deps for stuff";

  inputs = {
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
            beam.packages.erlangR25.elixir_1_14
            beam.packages.erlang.rebar3
            beam.packages.erlangR25.hex
            erlangR25
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
