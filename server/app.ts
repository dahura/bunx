// @jsx h
import Bun from "bun";
import Counter from "../components/counter.tsx";
import { render } from "../render/renderer.tsx";
import { Greetings } from "../components/greetings.tsx";

Bun.serve({
  port: 3000,
  fetch() {
    const html = render(Counter);
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
});

console.log("Server running at http://localhost:3000");
