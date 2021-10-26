// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
//     import socket from "./socket"
//
import "phoenix_html"
import { Socket } from "phoenix"
import { LiveSocket } from "phoenix_live_view"
import topbar from "topbar";
import { unpack } from 'msgpackr/unpack';

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
let liveSocket = new LiveSocket("/live", Socket, { params: { _csrf_token: csrfToken } })

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" })
window.addEventListener("phx:page-loading-start", info => topbar.show())
window.addEventListener("phx:page-loading-stop", info => topbar.hide())

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)
window.liveSocket = liveSocket

if (document.getElementById("game_screen") !== null) {
  let container = document.getElementById("game_screen")
  let screen = document.getElementById("screen_view");
  let ctx = screen.getContext("2d");

  let width = parseInt(screen.dataset.width);
  let height = parseInt(screen.dataset.height);

  ctx.imageSmoothingEnabled = false;

  let containerWidth = container.clientWidth - (
    parseInt(window.getComputedStyle(container).getPropertyValue("padding-left")) +
    parseInt(window.getComputedStyle(container).getPropertyValue("padding-right"))
  );
  screen.width = width;
  screen.height = height;
  screen.style.width = `${containerWidth}px`;
  screen.style.height = `${(height / width) * containerWidth}px`;

  window.addEventListener("resize", () => {
    let containerWidth = container.clientWidth - (
      parseInt(window.getComputedStyle(container).getPropertyValue("padding-left")) +
      parseInt(window.getComputedStyle(container).getPropertyValue("padding-right"))
    );
    screen.style.width = `${containerWidth}px`;
    screen.style.height = `${(height / width) * containerWidth}px`;
  });

  let socket = new Socket("/socket", { params: { _csrf_token: csrfToken } })
  socket.connect()

  let screen_channel = socket.channel("screen", {})

  let imageData = ctx.getImageData(0, 0, width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      var i = 4 * y * width + 4 * x;
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 255;
    }
  }

  let image = new Uint8ClampedArray(imageData.data);

  ctx.putImageData(imageData, 0, 0);

  screen_channel.on("diff", ({ data: data_compressed }) => {
    let imageData = ctx.getImageData(0, 0, width, height);
    imageData.data = image;
    const data = unpack(Uint8Array.from(window.atob(data_compressed), c => c.charCodeAt(0)));

    for (const { new: { r, g, b }, x, y } of data) {
      var i = 4 * y * width + 4 * x;
      image[i] = r;
      image[i + 1] = g;
      image[i + 2] = b;
      image[i + 3] = 255;
    }

    imageData.data.set(image);
    ctx.putImageData(imageData, 0, 0);
  });

  screen_channel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })

  window.addEventListener("load", () =>
    screen_channel.push("request_full", {}));

  window.addEventListener("online", () =>
    screen_channel.push("request_full", {}));

  screen_channel.push("request_full", {});
}
