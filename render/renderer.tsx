// renderer.ts
/** @jsx h */
import { h, renderSSR, jsx } from "nano-jsx";
import type { JsxElement } from "typescript";

// Interface for event handler information
interface EventHandlerInfo {
  elementId: string;
  eventType: string;
  handler: string; // Store as string since we're parsing from toString() output
}

// Генерация уникального ID для элементов
let elementIdCounter = 0;
function generateElementId(): string {
  return `nano-el-${++elementIdCounter}`;
}

// Извлечение обработчиков событий из строкового представления элемента
function extractEventHandlersFromString(
  elementStr: string
): EventHandlerInfo[] {
  const handlers: EventHandlerInfo[] = [];

  // Simple approach: just find all event handlers and generate IDs for them
  // We'll generate IDs in order and assume they'll be applied to the HTML in the same order

  // Pattern to match event handlers in the component string
  const eventRegex = /(on\w+)\s*:\s*([^,}]+)/g;

  let match: RegExpExecArray | null;
  while ((match = eventRegex.exec(elementStr)) !== null) {
    const eventType = match[1]?.toLowerCase().replace("on", "") || "click";
    const handlerStr = match[2]?.trim() || "";

    // Проверка, что это действительно функция
    if (
      handlerStr.startsWith("()") ||
      handlerStr.startsWith("function") ||
      handlerStr.includes("=>") ||
      (handlerStr.startsWith("(") && handlerStr.includes("=>"))
    ) {
      // Generate a new ID for this handler
      const elementId = generateElementId();

      handlers.push({
        elementId: elementId,
        eventType: eventType,
        handler: handlerStr,
      });
    }
  }

  return handlers;
}

// Add IDs to HTML elements
function addIdsToHtml(html: string, handlers: EventHandlerInfo[]): string {
  // Simple approach: add IDs to button elements in order
  // This is a basic implementation that assumes buttons are in the same order as handlers

  let handlerIndex = 0;
  const modifiedHtml = html.replace(/<button([^>]*)>/g, (match, attrs) => {
    // Check if this button already has an ID or if we've run out of handlers
    if (attrs.includes('id="') || handlerIndex >= handlers.length) {
      return match;
    }

    // Add the ID from the corresponding handler
    const handler = handlers[handlerIndex];
    handlerIndex++;

    return `<button id="${handler.elementId}"${attrs}>`;
  });

  return modifiedHtml;
}

// Генерация клиентского скрипта для обработчиков событий
function generateClientScript(handlers: EventHandlerInfo[]): string {
  if (handlers.length === 0) return "";

  // Create a registry of handlers
  const handlerRegistry: Record<string, string> = {};
  handlers.forEach((handler, index) => {
    handlerRegistry[`handler_${index}`] = handler.handler;
  });

  const scriptLines = [
    'document.addEventListener("DOMContentLoaded", function() {',
    "  // Handler registry",
  ];

  // Add handlers to registry
  Object.entries(handlerRegistry).forEach(([key, handlerStr]) => {
    scriptLines.push(`  const ${key} = ${handlerStr};`);
  });

  scriptLines.push(" ");

  // Attach handlers to elements
  handlers.forEach((handler, index) => {
    scriptLines.push(
      `  const el_${index} = document.getElementById("${handler.elementId}");`
    );
    scriptLines.push(`  if (el_${index}) {`);
    scriptLines.push(
      `    el_${index}.addEventListener("${handler.eventType}", ${
        "handler_" + index
      });`
    );
    scriptLines.push(`  }`);
  });

  scriptLines.push("});");

  return scriptLines.join("\n");
}

// Главная функция рендера компонента в HTML
export function render(component: any): string {
  // Получение строкового представления компонента
  const componentStr = component.toString();

  // Извлечение обработчиков событий из строкового представления
  let eventHandlers = extractEventHandlersFromString(componentStr);

  // Render the component to HTML first
  let htmlOutput = renderSSR(() => {
    return (
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Bunx</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        </head>
        <body>
          <div id="root">{component}</div>
        </body>
      </html>
    );
  });

  // Add IDs to HTML elements
  htmlOutput = addIdsToHtml(htmlOutput, eventHandlers);

  // Generate client script
  const clientScript = generateClientScript(eventHandlers);

  // Add client script to HTML
  htmlOutput = htmlOutput.replace(
    "</body>",
    `  ${clientScript ? `<script>${clientScript}</script>` : ""}\n  </body>`
  );

  return htmlOutput;
}
