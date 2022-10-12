import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete";
import {
  history,
  historyKeymap,
  indentWithTab,
  standardKeymap,
} from "@codemirror/commands";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { EditorState, Text } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { githubLight } from "@ddietr/codemirror-themes/theme/github-light.js";
import { javascript } from "@codemirror/lang-javascript";

const effect_template = `// Writing effects:
//  Effects are written as a class with an 'update' method that is
//  called to render each frame.
//
// The class you write will be initialized with the backing display for you to manipulate:
//
// display:
//   an object that has a 'setPixel' method, and a 'flush' method,
//    it also has 'width' and 'height' attributes:
//
//   setPixel: function(x: number, y: number, v: [number, number, number])
//     Use this to set the colour of a pixel on the screen
//     v is a 3-tuple of RGB values in the range 0-255
//
//   flush: function()
//     Use this to flush the display buffer to the system.
//     Make sure to call this, otherwise you'll not see anything!
//
//   width: number
//   height: number
//     The size of the display in pixels. 0,0 is the top left corner
//
//

return class MyEffect {
  constructor(display) {
    this.display = display;

    this.#clear();
  }

  #clear() {
    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        this.display.setPixel(x, y, [0, 0, 0]);
      }
    }

    this.display.flush();
  }

  update() {
  }
}
`;

function getCode() {
  const saved = localStorage.getItem("savedCode");

  console.log("loading saved code", saved);

  if (saved) {
    return Text.of(JSON.parse(saved));
  }

  return Text.of(effect_template.split("\n"));
}

class MockDisplay {
  #buffer;

  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.#buffer = Array.from(
      Array(width),
      () => Array.from(Array(height), () => [0, 0, 0]),
    );
  }

  setPixel(x, y, [r, g, b]) {
    this.#buffer[x][y] = [r, g, b];
  }

  flush() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const pix = document.getElementById(`screen_pix_${x}_${y}`);
        const [r, g, b] = this.#buffer[x][y];
        if (pix === null) {
          continue;
        }
        pix.setAttribute("fill", `rgb(${r}, ${g}, ${b})`);
      }
    }
  }
}

scrollTheme = EditorView.theme({
  "&": { height: "80vh" },
  ".cm-scroller": { overflow: "auto" },
});

addEventListener("DOMContentLoaded", () => {
  const editor = new EditorView({
    parent: document.getElementById("editor"),
    state: EditorState.create({
      doc: getCode(),
      extensions: [
        autocompletion(),
        closeBrackets(),
        history(),
        keymap.of([
          ...closeBracketsKeymap,
          ...historyKeymap,
          indentWithTab,
          ...standardKeymap,
        ]),
        lineNumbers(),
        syntaxHighlighting(defaultHighlightStyle),
        githubLight,
        scrollTheme,
        javascript(),
        EditorView.updateListener.of((v) => {
          if (v.docChanged) {
            localStorage.setItem(
              "savedCode",
              JSON.stringify(v.state.doc.toJSON()),
            );
          }
        }),
      ],
    }),
  });

  editor.contentDOM.setAttribute("data-gramm", "false");

  let nextEffect = null;
  let currentEffect = null;

  document.getElementById("reload-effect-button").addEventListener(
    "click",
    () => {
      const body = [...editor.state.doc.iter()].join("\n");
      try {
        const f = Function(body);
        const mod = f();
        console.log("setting effect to", f, mod);
        if (mod === undefined) {
          window.alert(
            "Couldn't seem to load your effect, make sure you have `return class MyEffect`",
          );
        }
        nextEffect = mod;
      } catch (error) {
        window.alert(`Building effect failed: ${error}`);
        console.error(error);
      }
    },
  );

  document.getElementById("reset-code-button").addEventListener("click", () => {
    const new_content = Text.of(effect_template.split("\n"));
    const update = editor.state.update({
      changes: { from: 0, to: editor.state.doc.length, insert: new_content },
    });
    editor.dispatch(update);
  });

  setInterval(() => {
    if (nextEffect !== null) {
      try {
        currentEffect = new nextEffect(new MockDisplay(120, 80));
      } catch (error) {
        window.alert(`Starting effect failed: ${error}`);
        console.error(error);
        console.log("the effect", nextEffect);
      }
      nextEffect = null;
    }

    if (currentEffect !== null) {
      try {
        currentEffect.update();
      } catch (error) {
        window.alert(`Effect update failed: ${error}`);
        console.error(error);
        currentEffect = null;
      }
    }
  }, 1000 / 20);
});
