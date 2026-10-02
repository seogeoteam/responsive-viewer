import { config } from '../config/env'

export interface LayoutAnalysisResponse {
  summary: string
  suggestions: string[]
  rawResponse: string
}

/**
 * AI-assisted responsive layout auditor using Gemini Flash REST endpoint
 * Directly compatible with Chrome Extension Manifest V3 without Node runtime dependencies
 */
export class AiAuditService {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || config.geminiApiKey
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0)
  }

  public setApiKey(key: string): void {
    this.apiKey = key
  }

  /**
   * Analyze responsive layout from an active viewport screenshot
   * @param imageBase64 - base64 PNG data from canvas
   * @param deviceName - current device name (e.g. "iPhone 15 Pro", "Desktop 1080p")
   * @param viewport - { width, height }
   */
  public async auditViewport(
    imageBase64: string,
    deviceName: string,
    viewport: { width: number; height: number }
  ): Promise<string> {
    if (!this.hasApiKey()) {
      throw new Error(
        'Gemini API Key is missing. Set REACT_APP_GEMINI_API_KEY in your local .env.local file.'
      )
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg);base64,/, '')
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`

    const prompt = `You are a Senior Responsive Design & Web Performance Engineer.
Analyze this viewport screenshot captured on ${deviceName} (${viewport.width}x${viewport.height}px).

1. Check for horizontal overflow or awkward element stacking.
2. Check touch targets, buttons, and navigation tap areas.
3. Check typography legibility and spacing.
Provide actionable bullet points with CSS code snippets where fixes are needed.`

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/png',
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(
        `Gemini API Error (${response.status}): ${err.error?.message || response.statusText}`
      )
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    return text || 'No visual layout issues detected.'
  }
}

export const aiAuditor = new AiAuditService()
