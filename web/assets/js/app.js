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
import NProgress from "nprogress"
import { LiveSocket } from "phoenix_live_view"
import * as pako from "pako"

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
let liveSocket = new LiveSocket("/live", Socket, { params: { _csrf_token: csrfToken } })

// Show progress bar on live navigation and form submits
window.addEventListener("phx:page-loading-start", info => NProgress.start())
window.addEventListener("phx:page-loading-stop", info => NProgress.done())

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)
window.liveSocket = liveSocket

let socket = new Socket("/socket", { params: { _csrf_token: csrfToken } })
socket.connect()

let screen_channel = socket.channel("screen", {})

screen_channel.on("diff", ({ data: data_compressed }) => {
  const arr = Uint8Array.from(atob(data_compressed), c => c.charCodeAt(0))
  const inflated = String.fromCharCode.apply(null, new Uint16Array(pako.inflate(arr)))
  const data = JSON.parse(inflated)

  for (const { new: { r, g, b }, x, y } of data) {
    const pix = document.getElementById(`screen_pix_${x}_${y}`)
    pix.setAttribute("fill", `rgb(${r}, ${g}, ${b})`)
  }
})

screen_channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

screen_channel.push("request_full", null)
