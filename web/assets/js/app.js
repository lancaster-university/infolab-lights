// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss";

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
//     import socket from "./socket"
//
import "phoenix_html";
import { Socket } from "phoenix";
import { LiveSocket } from "phoenix_live_view";
import topbar from "topbar";

const Hooks = {
  AnimDropdown: {
    mounted() {
      this.el.addEventListener("click", (event) => {
        event.stopPropagation();
        this.el.closest(".dropdown").classList.toggle("is-active");
      });
    },
  },
};

const csrfToken = document.querySelector("meta[name='csrf-token']")
  .getAttribute(
    "content",
  );
const liveSocket = new LiveSocket("/live", Socket, {
  params: { _csrf_token: csrfToken },
  hooks: Hooks,
});

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" });
addEventListener("phx:page-loading-start", (info) => topbar.show());
addEventListener("phx:page-loading-stop", (info) => topbar.hide());

// connect if there are any LiveViews on the page
liveSocket.connect();

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)
window.liveSocket = liveSocket;

class ArrowHandler {
  constructor(receiver) {
    this.receiver = receiver;
    this.repeaters = {
      up: null,
      left: null,
      down: null,
      right: null,
    };

    this.keyMap = {
      up: {
        bubbles: true,
        cancelable: true,
        key: "ArrowUp",
        keyCode: 38,
        which: 38,
        code: "ArrowUp",
      },
      left: {
        bubbles: true,
        cancelable: true,
        key: "ArrowLeft",
        keyCode: 37,
        which: 37,
        code: "ArrowLeft",
      },
      down: {
        bubbles: true,
        cancelable: true,
        key: "ArrowDown",
        keyCode: 40,
        which: 40,
        code: "ArrowDown",
      },
      right: {
        bubbles: true,
        cancelable: true,
        key: "ArrowRight",
        keyCode: 39,
        which: 39,
        code: "ArrowRight",
      },
    };
  }

  handlePress(direction, elem) {
    if (this.repeaters[direction] !== null) {
      clearInterval(this.repeaters[direction]);
    }

    this.receiver.dispatchEvent(
      new KeyboardEvent("keydown", this.keyMap[direction]),
    );
    setTimeout(() => {
      this.receiver.dispatchEvent(
        new KeyboardEvent("keyup", this.keyMap[direction]),
      );
    }, 50);

    this.repeaters[direction] = setInterval(() => {
      this.receiver.dispatchEvent(
        new KeyboardEvent("keydown", this.keyMap[direction]),
      );
      setTimeout(() => {
        this.receiver.dispatchEvent(
          new KeyboardEvent("keyup", this.keyMap[direction]),
        );
      }, 50);
    }, 500);

    elem.classList.add("pressed-arrow");
  }

  handleDePress(direction, elem) {
    if (this.repeaters[direction] !== null) {
      clearInterval(this.repeaters[direction]);
    }

    elem.classList.remove("pressed-arrow");

    this.repeaters[direction] = null;
  }

  setupKeys() {
    for (const key of document.getElementsByClassName("arrow")) {
      const dir = key.dataset.dir;
      key.addEventListener("mousedown", () => this.handlePress(dir, key));
      key.addEventListener("touchstart", () => this.handlePress(dir, key));
      key.addEventListener("mouseup", () => this.handleDePress(dir, key));
      key.addEventListener("touchend", () => this.handleDePress(dir, key));
    }
  }
}

function setupBurgers() {
  document.querySelectorAll(".navbar-burger").forEach((elem) => {
    elem.addEventListener("click", () => {
      const target = document.getElementById(elem.dataset.target);
      elem.classList.toggle("is-active");
      target.classList.toggle("is-active");
    });
  });
}

addEventListener("DOMContentLoaded", () => {
  setupBurgers();

  if (document.getElementById("game_screen") !== null) {
    const container = document.getElementById("game_screen");

    const arrowHandler = new ArrowHandler(window);
    arrowHandler.setupKeys();

    const screen = document.getElementById("screen_view");
    const ctx = screen.getContext("2d");

    const width = parseInt(screen.dataset.width);
    const height = parseInt(screen.dataset.height);

    ctx.imageSmoothingEnabled = false;

    const containerWidth = container.clientWidth - (
      parseInt(
        window.getComputedStyle(container).getPropertyValue("padding-left"),
      ) +
      parseInt(
        window.getComputedStyle(container).getPropertyValue("padding-right"),
      )
    );

    screen.width = width;
    screen.height = height;
    screen.style.width = `${containerWidth}px`;
    screen.style.height = `${(height / width) * containerWidth}px`;

    addEventListener("resize", () => {
      const containerWidth = container.clientWidth - (
        parseInt(
          window.getComputedStyle(container).getPropertyValue("padding-left"),
        ) +
        parseInt(
          window.getComputedStyle(container).getPropertyValue("padding-right"),
        )
      );
      screen.style.width = `${containerWidth}px`;
      screen.style.height = `${(height / width) * containerWidth}px`;
    });

    const socket = new Socket("/socket", {
      params: { _csrf_token: csrfToken },
    });
    socket.connect();

    const screen_channel = socket.channel("screen", {});

    screen_channel.on("update", ({ data: b64_data }) => {
      const data = Uint8Array.from(
        atob(b64_data),
        (c) => c.charCodeAt(0),
      );
      const blob = new Blob([data.buffer], { type: "image/png" });
      const image = new Image();
      image.src = URL.createObjectURL(blob);
      image.onload = () => {
        ctx.drawImage(image, 0, 0);
      };
    });

    screen_channel.join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });
  }
});
