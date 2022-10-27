// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss";

import "phoenix_html";

function setupBurgers() {
  document.querySelectorAll(".navbar-burger").forEach((elem) => {
    console.log(elem);
    elem.addEventListener("click", () => {
      const target = document.getElementById(elem.dataset.target);
      elem.classList.toggle("is-active");
      target.classList.toggle("is-active");
    });
  });
}

addEventListener('DOMContentLoaded', () => {
  setupBurgers();
});
