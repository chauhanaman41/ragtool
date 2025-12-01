# Technical Documentation

---

## A. Problem Explanation

**Who faces this problem?**
- **Content creators** (bloggers, podcasters, YouTubers) who produce long‑form material.
- **Marketing teams** that need to maintain a consistent brand voice across LinkedIn, Twitter, Instagram, email newsletters, and YouTube.
- **SMEs & consultants** who repurpose white‑papers, research reports, or slide decks for social media.

**Why is it a problem?**
- Manual rewriting is **time‑consuming** (often hours per piece of content).
- Maintaining **consistent messaging and tone** across platforms is error‑prone.
- Small teams lack the resources to produce platform‑specific copy for every piece of content.

---

## B. User Persona & Use Cases

| Persona | Goal | Typical Use Case |
|---------|------|-----------------|
| **Solo Creator** | Publish a blog post and instantly get LinkedIn, Twitter, and Instagram versions. | Upload a PDF of a research article → one‑click generation of social posts. |
| **Marketing Manager** | Keep brand voice consistent across campaigns. | Paste a product description → generate email draft, YouTube description, and LinkedIn post for a product launch. |
| **Consultant** | Turn client reports into shareable content. | Provide a URL to a client‑hosted report → receive a concise blog summary and a Twitter thread. |

---

## C. Workflow / System Diagram

```mermaid
flowchart TD
    User[User] -->|Upload PDF / DOCX / Paste Text / Provide URL| Frontend[Next.js UI]
    Frontend -->|POST /api/parse/document| ParseDoc[Document Parser]
    Frontend -->|POST /api/parse/url| ParseURL[URL Parser (Jina AI)]
    ParseDoc -->|Extracted Text| Transform[Transform API]
    ParseURL -->|Extracted Text| Transform
    Transform -->|Prompt → OpenAI| OpenAI[OpenAI GPT‑3.5‑Turbo]
    OpenAI -->|Generated Content| Transform
    Transform -->|JSON Response| Frontend
    Frontend -->|Accordion UI| User
```

---

## D. Detailed Feature List

### Core Functionality
- **Multi‑source ingestion**: PDF, DOCX, raw text, and URL.
- **Robust text extraction**:
  - `pdf2json` for PDFs.
  - `mammoth` for DOCX.
  - Jina AI Reader for JavaScript‑rendered webpages.
- **AI‑driven generation** (OpenAI GPT‑3.5‑Turbo) for:
  - LinkedIn post.
  - Twitter/X thread.
  - Short blog post.
  - YouTube video description.
  - Email draft.
  - Instagram caption.
- **Single‑request response**: All six outputs returned in one JSON payload.
- **Collapsible accordion UI** with copy‑to‑clipboard for each output.

### Optional / Future Features
- **Customizable tone & length** sliders per output.
- **Support for additional platforms** (TikTok script, Facebook post, LinkedIn article).
- **Batch processing** of multiple files at once.
- **User authentication & saved history**.
- **Multi‑agent orchestration**: separate agents for extraction, summarisation, and style‑tuning.

---

## E. AI Behavior Explanation

### Prompts (excerpt)
```text
LinkedIn Prompt:
"Based on the following content, create a professional LinkedIn post (150‑200 words)..."

Twitter Prompt:
"Based on the following content, create a Twitter/X thread of 4‑6 tweets..."

YouTube Prompt:
"Based on the following content, create a YouTube video description (200‑300 words)..."

Email Prompt:
"Based on the following content, create a professional email draft..."

Instagram Prompt:
"Based on the following content, create an Instagram caption with emojis and hashtags..."
```

### Workflow Logic
1. **Receive request** → validate `text` field.
2. **Truncate** to 20 k characters (to respect token limits).
3. **Sequentially call** OpenAI with each prompt, awaiting the response before moving to the next (ensures rate‑limit safety).
4. **Collect** all responses into a single JSON object.
5. **Return** the object to the frontend.

### Triggers
- **User action**: clicking **Generate** after uploading/pasting a source.
- **Backend error handling**: if any AI call fails, the endpoint returns a 500 with an error message.

### Multi‑Agent Flow (Potential Extension)
- **Extractor Agent** – dedicated to parsing PDFs/DOCX/URLs.
- **Summariser Agent** – creates a concise summary used as a shared context for all downstream prompts.
- **Stylist Agent** – applies tone/style preferences per platform.
- **Orchestrator** – coordinates agents, aggregates results, and handles retries.

---

## F. Future Roadmap

| Milestone | Description |
|-----------|-------------|
| **v1.1** | Add tone/length sliders, support for TikTok script generation. |
| **v1.2** | User accounts with saved history and favorite prompts. |
| **v2.0** | Multi‑agent architecture (Extractor → Summariser → Stylist) for higher quality and lower latency. |
| **v2.1** | Integration with Notion API – push generated content directly to Notion pages. |
| **v2.2** | Export to PDF/Word directly from the UI. |
| **v3.0** | Marketplace for custom prompt packs (e.g., “Tech Blog”, “Health Coach”). |

---

*End of Document*
