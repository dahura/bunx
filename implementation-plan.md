# Detailed Implementation Plan

## Overview

We need to modify the `render/renderer.tsx` file to automatically extract event handlers from JSX components and generate corresponding client-side JavaScript to attach those handlers in the browser.

## Current Issues

1. Event handlers like `onClick` are not preserved in the SSR output
2. The current implementation has a hardcoded script for the Greetings component
3. We need a generic solution that works for any component with event handlers

## Solution Design

### 1. Event Handler Extraction

We'll create a function to traverse JSX elements and extract event handlers:

```typescript
interface EventHandlerInfo {
  elementId: string;
  eventType: string;
  handler: Function;
}

function extractEventHandlers(
  element: any,
  handlers: EventHandlerInfo[] = []
): EventHandlerInfo[] {
  // Base case: if element is null or undefined
  if (!element) return handlers;

  // Handle arrays of elements
  if (Array.isArray(element)) {
    element.forEach((child) => extractEventHandlers(child, handlers));
    return handlers;
  }

  // Handle functional components
  if (element.component && typeof element.component === "function") {
    const rendered = element.component(element.props || {});
    return extractEventHandlers(rendered, handlers);
  }

  // Handle regular elements with props
  if (element.props) {
    // Check for event handlers in props
    Object.keys(element.props).forEach((key) => {
      if (key.startsWith("on") && typeof element.props[key] === "function") {
        // Ensure the element has an ID
        if (!element.props.id) {
          // Generate a unique ID if needed
          element.props.id = `el-${Math.random().toString(36).substr(2, 9)}`;
        }

        handlers.push({
          elementId: element.props.id,
          eventType: key.substring(2).toLowerCase(), // onClick -> click
          handler: element.props[key],
        });
      }
    });

    // Recursively process children
    if (element.props.children) {
      extractEventHandlers(element.props.children, handlers);
    }
  }

  return handlers;
}
```

### 2. Function Serialization

We'll enhance the existing `serializeFunction` function:

```typescript
function serializeFunction(fn: Function): string {
  // Convert function to string
  const fnStr = fn.toString();

  // For arrow functions and regular functions, we need to create executable code
  // that can be run in the browser context
  return fnStr;
}
```

### 3. Client-Side Script Generation

We'll create a function to generate the client-side JavaScript:

```typescript
function generateClientScript(handlers: EventHandlerInfo[]): string {
  if (handlers.length === 0) return "";

  const scriptLines = [
    'document.addEventListener("DOMContentLoaded", function() {',
  ];

  handlers.forEach((handler) => {
    const serializedHandler = serializeFunction(handler.handler);
    scriptLines.push(
      `  document.getElementById("${handler.elementId}").addEventListener("${handler.eventType}", ${serializedHandler});`
    );
  });

  scriptLines.push("});");

  return scriptLines.join("\n");
}
```

### 4. Modified Render Function

We'll update the main render function:

```typescript
export function render(component: JsxElement): string {
  // Extract event handlers from the component
  const eventHandlers = extractEventHandlers(component);

  // Generate the client-side script
  const clientScript = generateClientScript(eventHandlers);

  return renderSSR(() => {
    // Render the component to HTML
    const componentHTML = component; // This will be processed by nano-jsx

    return (
      <html>
        <head>
          <title>Bunx</title>
        </head>
        <body>
          <div id="root">{componentHTML}</div>
          {clientScript && <script>{clientScript}</script>}
        </body>
      </html>
    );
  });
}
```

## Implementation Steps

### Step 1: Enhance the Transform Function

We need to modify the `transform` function to:

1. Traverse the JSX element tree
2. Extract event handlers
3. Ensure elements have IDs

### Step 2: Implement Event Handler Extraction

Create the `extractEventHandlers` function to recursively traverse JSX elements and collect event handler information.

### Step 3: Improve Function Serialization

Enhance the `serializeFunction` function to properly serialize event handlers for client-side execution.

### Step 4: Create Client Script Generator

Implement the `generateClientScript` function to create the JavaScript code that will attach event handlers on the client side.

### Step 5: Update Main Render Function

Modify the `render` function to use the new functionality and include the generated script in the output.

## Testing Plan

1. Test with the Greetings component to ensure the onClick handler works
2. Test with a component that has multiple event handlers
3. Test with nested components that have event handlers
4. Verify that components without event handlers still work correctly
5. Check that the generated HTML includes the proper script tags

## Edge Cases to Consider

1. Components without IDs - need to generate unique IDs
2. Multiple event handlers on the same element
3. Event handlers on nested components
4. Components that render to null or undefined
5. Event handlers that reference external variables or functions
