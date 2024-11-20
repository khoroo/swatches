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
          NEW = [ "#F55770" "#FC8A94" "#756448" "#4F4732" "#EB9B5E" "#F1D3AD" "#322111" ];
          Ocean = [ "#0F4C81" "#6FB7D6" "#B2D9EA" ];
          PoolSide = [ "#D17175" "#E36630" "#E2987F" "#F7DBCD" "#9AA98C" "#326350" "#35594D" "#3E400E" "#4E3715" "#9EA09F" ];
	  Meadow = ["#7EC61C" "#AFDAD7" "#F88E89" "#D2DF9A" "#9AACAA" "#268FAD" "#EEE322" "#6A8DB6" "#F0EDDA" "#EABBBB"];
        };

        styles = ''
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #f5f7fa;
            padding: 2em;
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .swatch-group {
            background: white;
            border-radius: 12px;
            padding: 1.5em;
            margin: 2em 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          
          .group-name {
            font-size: 1.5em;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 1em;
            border-bottom: 2px solid #edf2f7;
            padding-bottom: 0.5em;
          }
          
          .swatch-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 1em;
          }
          
          .swatch {
            position: relative;
            height: 120px;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            display: flex;
            align-items: flex-end;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .swatch:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }
          
          .hex {
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 8px;
            font-family: monospace;
            width: 100%;
            text-align: center;
            font-size: 0.9em;
          }
          
          .copy-notification {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: rgba(255,255,255,0.9);
            padding: 0.5em 1em;
            border-radius: 4px;
            font-weight: 500;
            opacity: 0;
            transition: transform 0.2s, opacity 0.2s;
          }
          
          .swatch.copied .copy-notification {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        '';

        script = ''
          document.querySelectorAll('.swatch').forEach(swatch => {
            swatch.addEventListener('click', async () => {
              const color = swatch.dataset.color;
              
              try {
                await navigator.clipboard.writeText(color);
                swatch.classList.add('copied');
                
                setTimeout(() => {
                  swatch.classList.remove('copied');
                }, 1000);
              } catch (err) {
                console.error('Failed to copy:', err);
              }
            });
          });
        '';

        mkSwatch = color: ''
          <div class="swatch" style="background: ${color}" data-color="${color}">
            <div class="hex">${color}</div>
            <div class="copy-notification">Copied!</div>
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
            <title>Color Swatches</title>
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
