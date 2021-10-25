import { Text } from "@codemirror/text";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/closebrackets";
import { standardKeymap, indentWithTab } from "@codemirror/commands";
import { lineNumbers } from "@codemirror/gutter";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { history, historyKeymap } from "@codemirror/history";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { githubLight } from '@ddietr/codemirror-themes/theme/github-light.js';
import { javascript } from "@codemirror/lang-javascript";

const effect_template = `// Writing effects:
//  Effects are written as a class with a method that is
//  called to render each frame.
//
// The class you write will be initialized with the parameters:
//  (set_pixel, width, height)
//
// set_pixel: function(x: number, y: number, [r, g, b]: [number, number, number])
//   Use this to set the colour of a pixel on the screen
//   RGB values are 0-255
//
// width: number
// height: number
//  The size of the display in pixels. 0,0 is the top left corner
//
//

class MyEffect {
  constructor(set_pixel, width, height) {
    this.set_pixel = set_pixel;
    this.width = width;
    this.height = height;

    this.#clear();
  }

  #clear() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.set_pixel(x, y, [0, 0, 0]);
      }
    }
  }

  update() {
  }
}
`;


function getCode() {
  const saved = localStorage.getItem('savedCode');

  if (saved) {
    return Text.of(JSON.parse(saved));
  }

  return effect_template;
}

function setPixel(x, y, [r, g, b]) {
  const pix = document.getElementById(`screen_pix_${x}_${y}`)
  if (pix === null) {
    return;
  }
  pix.setAttribute("fill", `rgb(${r}, ${g}, ${b})`)
}

scrollTheme = EditorView.theme({
  "&": { height: "80vh" },
  ".cm-scroller": { overflow: "auto" }
});

window.onload = () => {
  const language = new Compartment;

  const editor = new EditorView({
    parent: document.getElementById("editor"),
    state: EditorState.create({
      doc: getCode(),
      extensions: [
        defaultHighlightStyle,
        closeBrackets(),
        history(),
        keymap.of([...closeBracketsKeymap, ...historyKeymap, indentWithTab, ...standardKeymap]),
        lineNumbers(),
        githubLight,
        scrollTheme,
        language.of(javascript()),
        EditorView.updateListener.of((v) => {
          if (v.docChanged) {
            localStorage.setItem('savedCode', JSON.stringify(v.state.doc.toJSON()))
          }
        })
      ]
    })
  });

  editor.contentDOM.setAttribute("data-gramm", "false");

  let nextEffect = null;
  let currentEffect = null;

  document.getElementById("reload-effect-button").addEventListener("click", () => {
    const body = [...editor.state.doc.iter()].join("\n");
    const mod = Function("return (" + body + ")")();
    nextEffect = mod;
  });

  document.getElementById("reset-code-button").addEventListener("click", () => {
    const new_content = Text.of(effect_template.split("\n"));
    const update = editor.state.update({ changes: { from: 0, to: editor.state.doc.length, insert: new_content } });
    editor.dispatch(update);
  });

  setInterval(() => {
    if (nextEffect !== null) {
      currentEffect = new nextEffect(setPixel, 120, 80);
      nextEffect = null;
    }

    if (currentEffect !== null) {
      currentEffect.update();
    }
  }, (1000 / 20));
};
