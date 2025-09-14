# Renderer Modification Plan

## Current Implementation Analysis

The current renderer in `render/renderer.tsx` uses nano-jsx for server-side rendering. The key components are:

1. `renderSSR` function that converts JSX to HTML strings
2. Event handlers like `onClick` are currently not preserved in the SSR output
3. The Greetings component has an `onClick` handler that shows an alert

## Implementation Approach

### 1. Extract Event Handlers from JSX Elements

We need to create a function that traverses JSX elements and extracts event handlers:

```typescript
interface EventHandler {
  elementId: string;
  eventType: string;
  handler: Function;
}

function extractEventHandlers(element: any): EventHandler[] {
  // Implementation will traverse the JSX element tree
  // and extract event handlers like onClick, onChange, etc.
}
```

### 2. Serialize Event Handler Functions

We need to convert event handler functions to strings that can be embedded in the HTML:

```typescript
function serializeFunction(fn: Function): string {
  return fn.toString();
}
```

### 3. Generate Client-Side Script

We need to generate a script that will:

1. Find elements by their IDs
2. Attach event listeners to those elements
3. Execute the original event handler functions

```javascript
const script = `
  document.addEventListener('DOMContentLoaded', function() {
    // Attach event handlers to elements
    document.getElementById('greetings').addEventListener('click', function() {
      alert('Hello world!');
    });
  });
`;
```

### 4. Modify the Render Function

The main `render` function needs to be updated to:

1. Extract event handlers from the component
2. Generate the client-side script
3. Include the script in the rendered HTML

## Detailed Implementation Steps

### Step 1: Create Event Handler Extraction Function

We'll need to create a function that can traverse JSX elements and identify event handlers. Based on the nano-jsx implementation, event handlers are identified by properties that start with "on" (onClick, onChange, etc.).

### Step 2: Modify the Transform Function

The current `transform` function in `renderer.tsx` needs to be enhanced to:

1. Identify elements with event handlers
2. Assign IDs to elements that don't have them
3. Collect event handler information

### Step 3: Generate Client-Side Script

Create a function that generates the JavaScript code to attach event handlers on the client side.

### Step 4: Update the Render Function

Modify the main render function to:

1. Use the enhanced transform function
2. Generate the client-side script
3. Include the script in the final HTML output

## Expected Output

For the Greetings component, the output should be:

```html
<html>
  <head>
    <title>Bunx</title>
  </head>
  <body>
    <div id="root">
      <button id="greetings">click me</button>
    </div>
    <script>
      document.addEventListener("DOMContentLoaded", function () {
        document
          .getElementById("greetings")
          .addEventListener("click", function () {
            alert("Hello world!");
          });
      });
    </script>
  </body>
</html>
```

## Implementation Considerations

1. **ID Generation**: Elements without IDs need to have unique IDs generated
2. **Event Handler Serialization**: Functions need to be converted to strings properly
3. **Multiple Event Types**: Support for various event types (onClick, onChange, etc.)
4. **Error Handling**: Graceful handling of serialization errors
5. **Performance**: Efficient traversal and extraction of event handlers
