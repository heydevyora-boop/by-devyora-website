/**
 * The states and cities By Devyora lists on every material and product page
 * ("…, by city"). One list, edited here, shown everywhere.
 *
 * A city may sit under more than one state where it serves both, as
 * Chandigarh does for Haryana and Punjab — SERVICE_CITIES below dedupes
 * that down to one entry per city for the flat list CityCoverage renders.
 */
export type ServiceState = { state: string; cities: string[] };

export const SERVICE_STATES: ServiceState[] = [
  { state: "Andhra Pradesh", cities: ["Amaravati", "Visakhapatnam"] },
  { state: "Arunachal Pradesh", cities: ["Itanagar", "Tawang"] },
  { state: "Assam", cities: ["Dispur", "Guwahati"] },
  { state: "Bihar", cities: ["Patna", "Gaya"] },
  { state: "Chhattisgarh", cities: ["Raipur", "Bilaspur"] },
  { state: "Goa", cities: ["Panaji", "Margao"] },
  { state: "Gujarat", cities: ["Gandhinagar", "Ahmedabad"] },
  { state: "Haryana", cities: ["Chandigarh", "Gurugram"] },
  { state: "Himachal Pradesh", cities: ["Shimla", "Dharamshala"] },
  { state: "Jharkhand", cities: ["Ranchi", "Jamshedpur"] },
  { state: "Karnataka", cities: ["Bengaluru", "Mysuru"] },
  { state: "Kerala", cities: ["Thiruvananthapuram", "Kochi"] },
  { state: "Madhya Pradesh", cities: ["Bhopal", "Indore"] },
  { state: "Maharashtra", cities: ["Mumbai", "Pune"] },
  { state: "Manipur", cities: ["Imphal", "Thoubal"] },
  { state: "Meghalaya", cities: ["Shillong", "Tura"] },
  { state: "Mizoram", cities: ["Aizawl", "Lunglei"] },
  { state: "Nagaland", cities: ["Kohima", "Dimapur"] },
  { state: "Odisha", cities: ["Bhubaneswar", "Cuttack"] },
  { state: "Punjab", cities: ["Chandigarh", "Amritsar"] },
  { state: "Rajasthan", cities: ["Jaipur", "Jodhpur"] },
  { state: "Sikkim", cities: ["Gangtok", "Namchi"] },
  { state: "Tamil Nadu", cities: ["Chennai", "Coimbatore"] },
  { state: "Telangana", cities: ["Hyderabad", "Warangal"] },
  { state: "Tripura", cities: ["Agartala", "Udaipur"] },
  { state: "Uttar Pradesh", cities: ["Lucknow", "Kanpur"] },
  { state: "Uttarakhand", cities: ["Dehradun", "Haridwar"] },
  { state: "West Bengal", cities: ["Kolkata", "Siliguri"] },
];

export type ServiceCity = { name: string; slug: string };

function slugifyCityName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Every city above, flattened and deduplicated (a city like Chandigarh that
 * serves more than one state appears once), in first-seen order, each with
 * a slug for its future landing page. CityCoverage renders this — not
 * SERVICE_STATES directly — as a flat list with no state grouping.
 */
export const SERVICE_CITIES: ServiceCity[] = (() => {
  const seenSlugs = new Set<string>();
  const cities: ServiceCity[] = [];
  for (const { cities: stateCities } of SERVICE_STATES) {
    for (const name of stateCities) {
      const slug = slugifyCityName(name);
      if (seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);
      cities.push({ name, slug });
    }
  }
  return cities;
})();
