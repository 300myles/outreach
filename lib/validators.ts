import dns from "dns/promises";

export function isValidEmailFormat(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function hasMXRecord(email: string) {
  const domain = email.split("@")[1];
  try {
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch {
    return false;
  }
}

export async function isValidWebsite(url: string) {
  try {
    const parsed = new URL(
      url.startsWith("http") ? url : `https://${url}`
    );

    const res = await fetch(parsed.toString(), {
      method: "HEAD",
      redirect: "follow",
    });

    return res.ok;
  } catch {
    return false;
  }
}
