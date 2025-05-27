# mcp-ui Project Documentation

## 1. Overview

### Purpose of `mcp-ui`
`mcp-ui` is a project designed to enable the creation and rendering of user interface (UI) components within applications that utilize the Model Context Protocol (MCP). It provides a standardized way to define UI elements that can be exchanged and displayed across different parts of an MCP-based system.

### Its Role Within the Model Context Protocol (MCP) Ecosystem
In the MCP ecosystem, `mcp-ui` serves as a bridge between backend services or agents that generate UI-relevant data and frontend applications that need to render this UI to the user. It allows for dynamic UI generation and interaction, where UI components can be treated as resources within the MCP framework. This facilitates scenarios where parts of the UI are not statically defined in the client application but are instead provided by other services or agents in response to user actions or system events.

### Target Audience
The primary target audience for `mcp-ui` is developers building applications and services within the Model Context Protocol ecosystem. This includes:
*   Backend developers who need to define and serve UI components.
*   Frontend developers who need to integrate and render these components within their client applications.
*   Developers creating agents or tools that interact with or provide UI elements in an MCP environment.

## 2. Project Architecture

### Monorepo Structure (pnpm workspaces)
The `mcp-ui` project is organized as a monorepo using pnpm workspaces. This structure helps manage dependencies and inter-package links more effectively, allowing for shared code and streamlined development across different parts of the project.

### Key Packages and Their Roles

*   **`@mcp-ui/client`**: This package contains React components responsible for rendering the UI elements defined by `mcp-ui`. A key component is `<HtmlResource>`, which handles the display of HTML-based UI blocks. It manages the rendering logic, including the creation of iframes and handling interactions.

*   **`@mcp-ui/server`**: This package provides server-side utilities for creating UI resource blocks. For instance, the `createHtmlResource` function helps in constructing `HtmlResourceBlock` objects with appropriate URI schemes and content, simplifying the process for backend services.

*   **`@mcp-ui/shared`**: This package defines common types and interfaces used across both the client and server packages. Important types include `HtmlResourceBlock` (the core data structure for defining an HTML UI element) and `ResourceContentPayload` (used for message passing).

### Brief Mention of Other Directories

*   **`examples/server`**: This directory likely contains example server implementations demonstrating how to use the `@mcp-ui/server` package to create and serve UI resources. These examples are crucial for developers looking to integrate `mcp-ui` into their backend services.
*   **`docs`**: This directory houses the project's documentation, including guides, API references, and potentially architectural overviews.

## 3. Core Functionality

### `HtmlResourceBlock`
The `HtmlResourceBlock` is the central data structure for defining an HTML-based UI component in `mcp-ui`.

*   **Structure**:
    *   `uri`: A string URI that specifies how the HTML content should be loaded and rendered.
    *   `mimeType`: Specifies the content type, typically `"text/html"` for these blocks.
    *   `text` / `blob`: These fields carry the actual HTML content.
        *   `text`: Used when the HTML content is provided directly as a string.
        *   `blob`: Used when the HTML content is provided as a byte array or binary large object.

*   **URI Schemes and Rendering Implications**:
    *   `ui://`: This scheme indicates that the HTML content is inline (provided via the `text` or `blob` field of the `HtmlResourceBlock`). The `@mcp-ui/client` renders this content by creating an iframe and setting its `srcdoc` attribute. This is generally safer as the content is self-contained.
    *   `ui-app://`: This scheme indicates that the HTML content should be fetched from an external URL. The part of the URI following `ui-app://` specifies the actual URL. The client renders this by creating an iframe and setting its `src` attribute to this external URL. This method introduces security considerations as it involves loading content from potentially untrusted sources.

*   **`text` vs. `blob` Delivery Methods**:
    *   `text`: Delivers HTML content as a string. Suitable for simple, static HTML.
    *   `blob`: Delivers HTML content as binary data. This can be useful for larger HTML payloads or when the content is generated or processed in a binary format.

### UI Action Mechanism
A crucial aspect of `mcp-ui` is enabling interaction between the rendered UI (within an iframe) and the main client application.

*   **`window.parent.postMessage`**: Content running inside the iframe can communicate actions or data back to the parent application (the client hosting the `<HtmlResource>` component) using the standard browser `window.parent.postMessage` API. This allows, for example, a button click within the iframe to trigger an action in the main application.
*   **`onUiAction` Prop**: The `@mcp-ui/client` component (e.g., `<HtmlResource>`) accepts an `onUiAction` prop. This prop is a callback function that gets invoked when the client receives a `postMessage` from the iframe. The payload of the `postMessage` (typically a `ResourceContentPayload`) is passed to this callback, allowing the client application to react appropriately.

### Server-Side Creation
The `@mcp-ui/server` package simplifies the creation of `HtmlResourceBlock` instances on the server-side. Functions like `createHtmlResource` abstract the details of structuring the block, setting the correct URI scheme based on whether the content is inline or external, and packaging the HTML content.

### Client-Side Rendering
The `@mcp-ui/client` package, particularly components like `<HtmlResource>`, handles the rendering of these blocks. It inspects the `uri` to determine the rendering strategy (iframe `srcdoc` for `ui://` or iframe `src` for `ui-app://`). It also sets up the `message` event listener to receive actions from the iframe via `postMessage` and forwards them to the `onUiAction` callback.

## 4. Current Limitations and Challenges

*   **Security Concerns with `iframe`-based Rendering**:
    *   **Risks of `ui-app://`**: Loading content from external URLs (`ui-app://`) via iframes inherently carries security risks, such as cross-site scripting (XSS) if the external source is compromised or malicious.
    *   **`postMessage` Safety**: While `postMessage` is a standard mechanism, its secure use requires careful implementation. Missing origin checks or overly permissive `targetOrigin` values can expose the application to cross-origin attacks.
    *   **Importance of Sandboxing**: The `sandbox` attribute of iframes is crucial for limiting the capabilities of the embedded content (e.g., preventing script execution, form submission, etc., unless explicitly allowed). The current implementation needs robust sandboxing configurations.

*   **Limitations of Current HTML-over-iframe Methods**:
    *   **Styling Difficulties**: Styling content within an iframe to match the parent application can be challenging due to style isolation.
    *   **Complexity for Rich Interactions**: While `postMessage` allows for basic communication, implementing complex, rich interactions between the iframe and the parent application can become convoluted and lead to performance bottlenecks.
    *   **Potential Performance Issues**: Each iframe is a separate browsing context, which can consume additional memory and CPU resources, potentially impacting the performance of the main application, especially if many UI blocks are rendered.

*   **Experimental Nature**: As stated in its documentation, `mcp-ui` is an experimental project. This implies that APIs might change, features might be incomplete, and it may not yet be suitable for production use without further hardening and development.

## 5. Opportunities for Development and Scaling

### Exploring Alternative Rendering Methods

*   **React Server Components (RSC)**:
    *   **Benefits**: RSCs could allow UI components to be rendered on the server and streamed to the client as a description of the UI, which is then hydrated by React. This could reduce the amount of client-side JavaScript, improve initial load times, and maintain React's component model without iframes. It could also simplify data fetching for UI components.
    *   **Potential Implementation**: Investigate how `HtmlResourceBlock` definitions could be transformed into RSC payloads. This would involve changes to both server-side creation and client-side rendering, potentially leveraging Next.js or other RSC-compatible frameworks.

*   **Remote DOM**:
    *   **Benefits**: Remote DOM approaches involve sending a serialized representation of the DOM (or a part of it) from the server to the client, where it's then applied to the actual DOM. This can offer fine-grained control over the UI and avoid some of the isolation issues of iframes.
    *   **Potential Implementation**: Define a schema for serializing UI components and their updates. The client would have a renderer that interprets this schema and manipulates the DOM accordingly. This is a more significant architectural shift.

### Security Enhancements

*   **Stricter iframe Sandboxing**: Implement more restrictive default `sandbox` attributes for iframes and allow configurable sandboxing policies based on the trust level of the UI resource source.
*   **Content Security Policy (CSP) Integration**: Allow applications to define and enforce CSP directives for content loaded within `mcp-ui` iframes. This can help mitigate XSS and other injection attacks.
*   **Hardening `postMessage` Communication**:
    *   Enforce strict origin checks in the `onUiAction` handler to ensure messages are only processed from expected iframe origins.
    *   Provide clear guidance and possibly helper functions for developers to use specific `targetOrigin` values when the iframe sends messages.
*   **Configuration for Trusted URL Sources**: For `ui-app://` resources, implement a mechanism to configure a list of trusted domains or URL patterns from which UI content can be loaded.

### Broader Framework Support
Currently, `@mcp-ui/client` is React-focused. To increase adoption:
*   Develop client libraries or adapters for other popular frontend frameworks like Vue.js, Angular, or Svelte. This would involve creating equivalent components to `<HtmlResource>` and handling the framework-specific aspects of rendering and event handling.

### API Enhancements

*   **Expanding the UI Action API**:
    *   Define a set of standardized action types or a more structured payload for `postMessage` to simplify common interactions.
    *   Explore possibilities for bidirectional communication beyond the current one-way (iframe to parent) action flow, perhaps through a dedicated API that still respects security boundaries.
*   **Improving Resource Handling**:
    *   Introduce mechanisms for caching UI resources on the client to improve performance and reduce redundant fetches.
    *   Consider adding support for versioning of UI resources to manage updates and compatibility.
    *   Explore dynamic loading or streaming of UI content for very large or complex UI blocks.

### Developer Experience

*   **CLI Tools**: Develop Command Line Interface (CLI) tools to help with common tasks like:
    *   Bootstrapping new `mcp-ui` compatible projects or components.
    *   Validating `HtmlResourceBlock` definitions.
    *   Testing UI components in isolation.
*   **More Comprehensive Examples**: Provide a wider range of examples showcasing different use cases, advanced interactions, and integration with various backend and frontend setups.
*   **Debugging Utilities**: Create tools or guides to help developers debug issues related to `mcp-ui`, such as `postMessage` communication problems or rendering errors within iframes.

## 6. Conclusion

### Summary of `mcp-ui`'s Value Proposition
`mcp-ui` offers a valuable, albeit experimental, approach to decoupling UI generation from client applications within the Model Context Protocol. It enables dynamic and context-aware user interfaces by treating UI elements as resources that can be served and rendered on demand. This flexibility is particularly powerful in distributed systems or agent-based architectures where different components might need to contribute to the user interface.

### Its Potential to Evolve
Despite its current limitations, particularly around security and the constraints of iframe-based rendering, `mcp-ui` has significant potential. By exploring alternative rendering methods like RSC or Remote DOM, enhancing security features, broadening framework support, and improving the developer experience, `mcp-ui` can evolve into a more robust, secure, and versatile solution. Such advancements would solidify its role as a key enabler of rich, interactive UIs within the MCP ecosystem, making it easier for developers to build sophisticated and adaptable applications.
