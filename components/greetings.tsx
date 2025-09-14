import { Button } from "nano-jsx/esm/ui/button.js";
import type { JsxElement } from "typescript";

export const Greetings = (): JsxElement => {
  return (
    <button id="greetings" onClick={() => alert("Hello world!")}>
      click me
    </button>
  );
};
