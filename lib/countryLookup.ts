// src/lib/countryLookup.ts

type Country = {
  name: string;
  value: string;
};

let countryMap: Map<string, string> | null = null;

export async function getCountryName(code: string): Promise<string> {
  // Lazy-load & cache
  if (!countryMap) {
    const data = (await import("../public/country.json")).default as Country[];

    countryMap = new Map(
      data.map(c => [
        c.value.toLowerCase(),
        c.name.split(" (")[0] // strip " (xx)"
      ])
    );
  }

  return countryMap.get(code.toLowerCase()) ?? code;
}
