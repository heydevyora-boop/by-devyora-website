/**
 * The states and cities By Devyora lists on every material and product page
 * ("…, by city"). One list, edited here, shown everywhere.
 *
 * Display only: these are names, not links. (The per-city landing pages the
 * SEO README describes are not built yet, so a link would lead nowhere.)
 * A city may sit under more than one state where it serves both, as
 * Chandigarh does for Haryana and Punjab.
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
