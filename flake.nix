{
  description = "Color swatch viewer";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        
        colors = {
          Fuzzy = [ "#AF3424" "#b3a83d" "#b49539" ];
          Ocean = [ "#0F4C81" "#6FB7D6" "#B2D9EA" ];
        };

        styles = builtins.readFile ./docs/styles.css;
        script = builtins.readFile ./docs/script.js;

        mkSwatch = color: ''
          <div class="swatch" style="background: ${color}" onclick="copyToClipboard('${color}')">
            <div class="hex">${color}</div>
          </div>
        '';

        mkGroup = name: colors: ''
          <div class="swatch-group">
            <div class="group-name">${name}</div>
            <div class="swatch-container">
              ${builtins.concatStringsSep "\n" (map mkSwatch colors)}
            </div>
          </div>
        '';

        colorGroups = builtins.concatStringsSep "\n" (
          pkgs.lib.mapAttrsToList mkGroup colors
        );

        html = pkgs.writeText "colors.html" ''
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              ${styles}
            </style>
          </head>
          <body>
            ${colorGroups}
            <script>
              ${script}
            </script>
          </body>
          </html>
        '';

      in {
        packages.default = pkgs.runCommand "color-swatches" {} ''
          mkdir -p $out
          cp ${html} $out/index.html
        '';
      });
}
