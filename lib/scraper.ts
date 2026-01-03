export async function scrapeBusinessData(searchQuery: string, location: string, apiKey: string) {
  try {
    // Using Serper.dev API for Google Search results
    const searchUrl = `https://google.serper.dev/search`
    const query = `${searchQuery} in ${location}`

    const response = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        location,
        type: "places",
        gl: "us",
        num: 20,
      }),
    })

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Scraper error:", error)
    throw error
  }
}

export async function extractEmailFromWebsite(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) return null

    const html = await response.text()

    // Email patterns
    const emailPatterns = [
      /contact@[\w.-]+/gi,
      /info@[\w.-]+/gi,
      /hello@[\w.-]+/gi,
      /admin@[\w.-]+/gi,
      /support@[\w.-]+/gi,
      /[\w.-]+@[\w.-]+\.(com|net|org|co)/gi,
    ]

    const emails = new Set<string>()

    emailPatterns.forEach((pattern) => {
      const matches = html.match(pattern)
      if (matches) {
        matches.forEach((email) => emails.add(email.toLowerCase()))
      }
    })

    // Filter out common noreply and test emails
    return Array.from(emails)
      .filter((email) => !email.includes("noreply") && !email.includes("test"))
      .slice(0, 3)[0]
  } catch (error) {
    console.error("Email extraction error:", error)
    return null
  }
}

export function generateNotes(html: string): string[] {
  const notes: string[] = []

  if (html.includes("mobile app") || html.includes("download app")) {
    notes.push("Has mobile app")
  }
  if (html.includes("pdf") || html.includes(".pdf")) {
    notes.push("PDF menu detected")
  }
  if (html.includes("order online") || html.includes("online ordering")) {
    notes.push("Online ordering available")
  }
  if (html.includes("delivery") || html.includes("doordash")) {
    notes.push("Delivery service active")
  }
  if (html.includes("reservation") || html.includes("book table")) {
    notes.push("Online reservations available")
  }

  return notes
}
