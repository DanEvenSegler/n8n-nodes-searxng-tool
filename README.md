# n8n-nodes-searxng

This is an n8n community node that integrates the [SearXNG](https://github.com/searxng/searxng) search engine into your n8n workflows. It can be used as a standalone node to fetch search results or attached to an **AI Agent** node as a **Web Search Tool**.

> [!IMPORTANT]  
> **Disclaimer**: This is a community-contributed integration node. The author of this package is not the owner of the SearXNG project and is not affiliated with or sponsored by the official SearXNG team.

- **SearXNG Project Repository**: [https://github.com/searxng/searxng](https://github.com/searxng/searxng)
- **SearXNG Documentation**: [https://docs.searxng.org/](https://docs.searxng.org/)

---

## Installation

To install this community node in your n8n instance:

1. Go to **Settings > Community Nodes**.
2. Click **Install a new node**.
3. Enter the npm package name: `n8n-nodes-searxng`
4. Agree to the risks and click **Install**.

*For more details, see n8n's [Community Nodes Installation Guide](https://docs.n8n.io/integrations/community-nodes/installation/).*

---

## Credentials

The node requires a configured **SearXNG API** credential to connect to your instance.

### Parameters:
- **Base URL** (Required): The URL of your SearXNG instance (e.g., `http://localhost:8080` or `https://searx.be`).
- **Authentication Type**:
  - **None**: For public or open instances that do not require authentication.
  - **Basic Auth**: For self-hosted instances protected by basic auth proxy (requires `Username` and `Password`).
  - **API Key**: For proxy gateways requiring a custom API key header (requires `Header Name`, default `X-API-KEY`, and `API Key` value).

---

## Standalone Operations & Properties

When used as a standard n8n workflow node, it outputs search results as a list of items.

- **Query** (Required): The search string to look up. Supports search operators (e.g., `site:github.com`).
- **Categories**: Select one or more search categories (General, News, Science, IT, Images, Videos, Maps, Music, Social Media, Files).
- **Time Range**: Filter results by a specific age (Any Time, Past Day, Past Week, Past Month, Past Year).
- **Page Number**: Specify the result page (starts from `1`).
- **Safe Search**: SafeSearch filter level (Off, Moderate, Strict).
- **Additional Options**:
  - **Engines**: Comma-separated list of specific engines to query (e.g., `google,bing,wikipedia`).
  - **Language**: Language code filter (e.g., `en-US`, `de-DE`).
  - **Limit**: Max number of search results to return (default: `10`).
  - **Raw Response**: Return the complete, unmodified JSON payload from the SearXNG API.

---

## AI Agent Tool Compatibility

This node includes the `usableAsTool: true` flag. It can be directly connected to the **Tools** input of an **AI Agent** node in n8n.

### Setup:
1. Drag the **AI Agent** node into your workflow.
2. Drag the **SearXNG** node into the workflow and connect it to the **Tools** connector of the AI Agent.
3. Configure the SearXNG credentials.
4. When the AI Agent runs, it will dynamically evaluate the user's prompt and call SearXNG as a tool to retrieve real-time search results.
5. **Output formatting**: By default, the node returns a clean, structured object containing only the `title`, `url`, and `content` (snippet) of each search result. This preserves token limits and makes parsing easy for LLMs.

---

## Local Development

If you want to modify this node or build it locally:

1. Clone your repository:
   ```bash
   git clone https://github.com/danev/n8n-nodes-searxng.git
   cd n8n-nodes-searxng
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Build the node:
   ```bash
   npm run build
   ```
4. Link the node locally to your n8n configuration:
   ```bash
   npm link
   # In your local n8n installation directory (~/.n8n)
   npm link n8n-nodes-searxng
   ```
5. Run the node in watch/development mode:
   ```bash
   npm run dev
   ```
