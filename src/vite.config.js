import { defineConfig } from "vite";
import { resolve } from "path";
import path from "path";
import handlebars from "vite-plugin-handlebars";
import viteImagemin from "vite-plugin-imagemin";
import viteWebP from "./plugins/vite-webP";
import viteWebpHtml from "./plugins/vite-webP-html";
import FullReload from "vite-plugin-full-reload";

const root = resolve(__dirname, "./");
const outDir = resolve(__dirname, "../dist");

export default defineConfig({
  base: "./",
  root,

  plugins: [
    FullReload(["./**/*"], { log: false }),
    viteWebP(),
    handlebars({
      partialDirectory: resolve(__dirname, "partials"),
    }),
    {
      enforce: "post",
      apply: "build",
      ...viteWebpHtml(),
    },
    viteImagemin({
      webp: {
        optimizationLevel: 6,
        quality: 100,
      },
      gifsicle: {
        optimizationLevel: 6,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 5,
        quality: 90,
      },
      mozjpeg: {
        optimizationLevel: 6,
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 11,
      },
      svgo: {
        plugins: [
          {
            name: "removeViewBox",
          },
          {
            name: "removeEmptyAttrs",
            active: false,
          },
        ],
      },
    }),
  ],
  build: {
    outDir,
    srcDir: "./",
    publicDir: "./",
    emptyOutDir: true,

    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
      },
      output: {
        assetFileNames: (assetInfo) => {
          var folderName = path.basename(path.dirname(assetInfo.name));
          var info = assetInfo.name.split(".");
          var extType = info[info.length - 1];
          if (/png|jpe?g|webp|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = "img";
          } else if (/woff|woff2|eot|ttf|/.test(extType)) {
            extType = "css";
          }
          return folderName === extType || folderName === "."
            ? `${extType}/[name]-[hash][extname]`
            : `${extType}/${folderName}/[name]-[hash][extname]`;
        },
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
      },
    },
  },

  server: {
    port: 3000,
    host: "0.0.0.0",
    hmr: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
