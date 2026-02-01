import axios from "axios";
import * as cheerio from "cheerio";
import pLimit from "p-limit";
import { getCountryName } from "./countryLookup";

// Concurrency limit (5 simultaneous requests)
const limit = pLimit(5);

// 1. Robust Email Regex
const EMAIL_REGEX = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g;

/**
 * Helper: Fetch HTML with timeouts and browser headers
 */
async function fetchHTML(url: string, retries = 1): Promise<string | null> {
  try {
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
      maxRedirects: 3,
    });
    return typeof data === "string" ? data : null;
  } catch (error) {
    if (retries > 0) return fetchHTML(url, retries - 1);
    return null;
  }
}

/**
 * Helper: Extract Data using DOM Parsing (Cheerio) & Regex
 * Replaces the AI extraction logic.
 */
function parseHtmlData(html: string) {
  const $ = cheerio.load(html);
  
  // Clean up
  $("script, style, svg, img, video, iframe, link, noscript").remove();
  const text = $("body").text();

  // 1. Extract Emails
  const rawEmails: string[] = text.match(EMAIL_REGEX) || [];
  
  // Also check mailto links specifically
  $('a[href^="mailto:"]').each((_, el) => {
    const email = $(el).attr("href")?.replace("mailto:", "");
    if (email) rawEmails.push(email);
  });

  // Unique and Clean Emails
  const uniqueEmails = [...new Set(rawEmails)]
    .map(e => e.toLowerCase().trim())
    .filter(e => !e.includes(".png") && !e.includes(".jpg") && !e.includes("sentry") && !e.includes("noreply"));

  // 2. Extract Socials
  const socialLinks: any = {};
  $('a[href]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    if (href.includes("facebook.com")) socialLinks.facebook = href;
    if (href.includes("linkedin.com")) socialLinks.linkedin = href;
    if (href.includes("instagram.com")) socialLinks.instagram = href;
    if (href.includes("twitter.com") || href.includes("x.com")) socialLinks.twitter = href;
  });

  // 3. Extract Meta Description (Fallback for AI Description)
  const metaDescription = $('meta[name="description"]').attr("content") || 
                          $('meta[property="og:description"]').attr("content") || "";

  // 4. Find Contact Page URL (for recursive search)
  let contactUrl = null;
  $('a').each((_, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().toLowerCase();
    if (href && (text.includes("contact") || href.includes("contact"))) {
        contactUrl = href;
    } else if (href && (text.includes("info") || href.includes("info"))) {
      contactUrl = href;
  }
  });

  return {
    emails: uniqueEmails,
    social_links: socialLinks,
    description: metaDescription.slice(0, 200), // Limit length
    contact_page_url: contactUrl
  };
}

/**
 * Logic: Process a single Google Maps result
 */
async function processSingleLead(place: any) {
  let scrapedData: any = { 
      emails: [], 
      social_links: {}, 
      description: "", 
      stats: {} // Empty stats as we don't have AI to calculate them
  };

  let confidence = 10; // Base confidence

  if (place.website) {
    console.log(`🔍 Visiting: ${place.website}`);
    const homeHTML = await fetchHTML(place.website);
    
    if (homeHTML) {
      confidence = 40; // Website is live
      const homeData = parseHtmlData(homeHTML);
      
      // Merge Data
      scrapedData.emails = homeData.emails;
      scrapedData.social_links = homeData.social_links;
      scrapedData.description = homeData.description;

      // RECURSIVE SEARCH: If no email found, check Contact page
      if (scrapedData.emails.length === 0 && homeData.contact_page_url) {
        try {
          const contactUrl = new URL(homeData.contact_page_url, place.website).toString();
          console.log(`  ↪ Follow-up: ${contactUrl}`);
          
          const contactHTML = await fetchHTML(contactUrl);
          if (contactHTML) {
            const contactData = parseHtmlData(contactHTML);
            scrapedData.emails = [...scrapedData.emails, ...contactData.emails];
            // Merge socials if found on contact page
            scrapedData.social_links = { ...scrapedData.social_links, ...contactData.social_links };
          }
        } catch (e) {
          // Ignore invalid URL errors
        }
      }
    }
  }

  // Calculate Confidence Score
  if (scrapedData.emails.length > 0) confidence = 90;
  else if (place.phone) confidence = Math.max(confidence, 30);

  // RETURN EXACT STRUCTURE EXPECTED BY DATABASE
  return {
    name: place.title,
    address: place.address,
    phone: place.phoneNumber,
    website: place.website,
    rating: place.rating,
    
    // Extracted Data
    email: scrapedData.emails[0] || null, // Primary Email
    secondary_emails: scrapedData.emails.slice(1),
    description: scrapedData.description,
    stats: {}, // Return empty object to satisfy model
    social: scrapedData.social_links,
    ai_confidence_score: confidence
  };
}

/**
 * Main Export: Called by the API Route
 */
export async function performDeepScraping(
  query: string,
  location: string | null,
  country: string | null,
  serperKey: string
) {

  let countryName = location
  if (country && !location) {
     countryName = await getCountryName(country);
  }

  const TOTAL_LIMIT = 50; // Total results you want
  const PER_PAGE = 10;    // Serper places usually return 10 per page
  const totalPages = Math.ceil(TOTAL_LIMIT / PER_PAGE);

  console.log(
    `Starting scrape for: ${query} in ${countryName} (${totalPages} pages)`
  );

  // 1. Generate Page Requests (Pages 1 to 5)
  const pageRequests = Array.from({ length: totalPages }, (_, i) => {
    const pageNum = i + 1;

    return axios.post(
      "https://google.serper.dev/places",
      {
        q: `${query} in ${countryName}`, 
        gl: country || "",
        page: pageNum
      },
      {
        headers: {
          "X-API-KEY": serperKey,
          "Content-Type": "application/json"
        }
      }
    );
  });

  // 2. Execute all API calls in parallel
  const pageResponses = await Promise.all(pageRequests);

  // 3. Flatten all results into a single array
  const allPlaces = pageResponses.flatMap(res => res.data.places || []);

  console.log(`Total data found: ${allPlaces.length}`);

  // 4. Visit websites in parallel (Limit 5 at a time)
  return Promise.all(
    allPlaces.map((p: any) => limit(() => processSingleLead(p)))
  );
}