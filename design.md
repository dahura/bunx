# Extracting JSX Logic to Script Tags

## Current Implementation Analysis

The project currently uses NanoJSX as its JSX library with the following structure:

1. Components are defined in `.tsx` files using JSX syntax
2. The renderer uses `renderSSR` to generate HTML on the server side
3. Components are rendered directly into the HTML body
4. There's a basic `transform` function that serializes functions, but it's not fully implemented

## Proposed Solution

To extract JSX logic from components and send it to script tags, we need to:

1. Create a more robust serialization mechanism for component logic
2. Modify the renderer to extract event handlers and dynamic logic
3. Generate JavaScript code that can be executed in the browser
4. Insert this JavaScript into `<script>` tags in the HTML output

## Implementation Plan

### 1. Enhanced Serialization Function

We need to create a function that can:

- Extract event handlers from component props
- Serialize component state and methods
- Convert JSX elements to a format that can be reconstructed in the browser

### 2. Renderer Modifications

The renderer needs to:

- Separate static HTML from dynamic logic
- Generate JavaScript code for client-side interactivity
- Insert the generated JavaScript into script tags

### 3. Client-Side Runtime

We need to provide a minimal runtime that can:

- Reconstruct components from serialized data
- Attach event handlers to DOM elements
- Manage component state on the client side

## Technical Details

### Component Analysis

For each component, we need to identify:

- Event handlers (props that start with "on" like onClick, onChange, etc.)
- State variables and methods
- Dynamic content that needs to be updated

### Serialization Format

We'll serialize components into a JSON structure that includes:

- Component type (tag name or component function)
- Static props
- Serialized event handlers
- Initial state

### Client-Side Reconstruction

The client-side runtime will:

- Parse the serialized component data
- Create DOM elements for static content
- Attach event listeners to elements
- Manage state updates and re-rendering

## Implementation Steps

1. Enhance the `transform` function to properly extract and serialize event handlers
2. Create a function to generate client-side JavaScript code from component logic
3. Modify the `render` function to include the generated JavaScript in script tags
4. Create a minimal client-side runtime for component reconstruction
5. Test with existing components
