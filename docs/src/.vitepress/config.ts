import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'en-US',
  title: 'MCP UI',
  description: 'MCP-UI Client & Server SDK Documentation',
  base: process.env.VITEPRESS_BASE || '/', // For GitHub Pages deployment

  vite: { // Vite specific config for VitePress
    plugins: [
    ]
  },

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/introduction' },
      // Add links to API docs if generated, e.g., using TypeDoc
      // { text: 'API', items: [
      //   { text: 'Client API', link: '/api/client/' },
      //   { text: 'Server API', link: '/api/server/' },
      //   { text: 'Shared API', link: '/api/shared/' },
      // ]}
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Overview',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Protocol Details', link: '/guide/protocol-details' }
          ],
        },
        {
          text: 'Shared Package (@mcp-ui/shared)',
          items: [
            { text: 'Overview', link: '/guide/shared/overview' },
            // { text: 'API', link: '/guide/shared/api' } // Placeholder
          ],
        },
        {
          text: 'Server SDK (@mcp-ui/server)',
          items: [
            { text: 'Overview', link: '/guide/server/overview' },
            { text: 'Usage & Examples', link: '/guide/server/usage-examples' },
            // { text: 'API', link: '/guide/server/api' } // Placeholder
          ],
        },
        {
          text: 'Client SDK (@mcp-ui/client)',
          items: [
            { text: 'Overview', link: '/guide/client/overview' },
            { text: 'HtmlResource Component', link: '/guide/client/html-resource' },
            { text: 'Usage & Examples', link: '/guide/client/usage-examples' },
            // { text: 'API', link: '/guide/client/api' } // Placeholder
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/idosal/mcp-ui' } // TODO: Update this link
    ],

    footer: {
      message: 'Released under the Apache 2.0 License.',
      copyright: 'Copyright © 2025-present Ido Salomon'
    }
  },
  markdown: {
    // options for markdown-it-anchor
    // anchor: { permalink: anchor.permalink.headerLink() },

    // options for markdown-it-toc
    // toc: { includeLevel: [1, 2] },
  }
}); 