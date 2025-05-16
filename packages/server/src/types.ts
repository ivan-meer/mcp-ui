export type ResourceContentPayload =
  | { type: 'directHtml'; htmlString: string }
  | { type: 'externalUrl'; iframeUrl: string };

export interface CreateHtmlResourceOptions {
  uri: string; // REQUIRED. Must start with "ui://" if content.type is "directHtml",
  // or "ui-app://" if content.type is "externalUrl".
  content: ResourceContentPayload; // REQUIRED. The actual content payload.
  delivery: 'text' | 'blob'; // REQUIRED. How the content string (htmlString or iframeUrl) should be packaged.
}
