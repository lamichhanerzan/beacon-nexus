export interface Parish {
  slug: string;
  name: string;
}

export interface Resource {
  name: string;
  number: string | null;
  telLink: string | null;
  description: string;
}

export const PARISHES: Parish[] = [
  { slug: "acadia", name: "Acadia" },
  { slug: "allen", name: "Allen" },
  { slug: "ascension", name: "Ascension" },
  { slug: "assumption", name: "Assumption" },
  { slug: "avoyelles", name: "Avoyelles" },
  { slug: "beauregard", name: "Beauregard" },
  { slug: "bienville", name: "Bienville" },
  { slug: "bossier", name: "Bossier" },
  { slug: "caddo", name: "Caddo" },
  { slug: "calcasieu", name: "Calcasieu" },
  { slug: "caldwell", name: "Caldwell" },
  { slug: "cameron", name: "Cameron" },
  { slug: "catahoula", name: "Catahoula" },
  { slug: "claiborne", name: "Claiborne" },
  { slug: "concordia", name: "Concordia" },
  { slug: "desoto", name: "De Soto" },
  { slug: "east-baton-rouge", name: "East Baton Rouge" },
  { slug: "east-carroll", name: "East Carroll" },
  { slug: "east-feliciana", name: "East Feliciana" },
  { slug: "evangeline", name: "Evangeline" },
  { slug: "franklin", name: "Franklin" },
  { slug: "grant", name: "Grant" },
  { slug: "iberia", name: "Iberia" },
  { slug: "iberville", name: "Iberville" },
  { slug: "jackson", name: "Jackson" },
  { slug: "jefferson", name: "Jefferson" },
  { slug: "jefferson-davis", name: "Jefferson Davis" },
  { slug: "lafayette", name: "Lafayette" },
  { slug: "lafourche", name: "Lafourche" },
  { slug: "lasalle", name: "La Salle" },
  { slug: "lincoln", name: "Lincoln" },
  { slug: "livingston", name: "Livingston" },
  { slug: "madison", name: "Madison" },
  { slug: "morehouse", name: "Morehouse" },
  { slug: "natchitoches", name: "Natchitoches" },
  { slug: "orleans", name: "Orleans" },
  { slug: "ouachita", name: "Ouachita" },
  { slug: "plaquemines", name: "Plaquemines" },
  { slug: "pointe-coupee", name: "Pointe Coupee" },
  { slug: "rapides", name: "Rapides" },
  { slug: "red-river", name: "Red River" },
  { slug: "richland", name: "Richland" },
  { slug: "sabine", name: "Sabine" },
  { slug: "st-bernard", name: "St. Bernard" },
  { slug: "st-charles", name: "St. Charles" },
  { slug: "st-helena", name: "St. Helena" },
  { slug: "st-james", name: "St. James" },
  { slug: "st-john-the-baptist", name: "St. John the Baptist" },
  { slug: "st-landry", name: "St. Landry" },
  { slug: "st-martin", name: "St. Martin" },
  { slug: "st-mary", name: "St. Mary" },
  { slug: "st-tammany", name: "St. Tammany" },
  { slug: "tangipahoa", name: "Tangipahoa" },
  { slug: "tensas", name: "Tensas" },
  { slug: "terrebonne", name: "Terrebonne" },
  { slug: "union", name: "Union" },
  { slug: "vermilion", name: "Vermilion" },
  { slug: "vernon", name: "Vernon" },
  { slug: "washington", name: "Washington" },
  { slug: "webster", name: "Webster" },
  { slug: "west-baton-rouge", name: "West Baton Rouge" },
  { slug: "west-carroll", name: "West Carroll" },
  { slug: "west-feliciana", name: "West Feliciana" },
  { slug: "winn", name: "Winn" }
];

export const RESOURCES: Resource[] = [
  {
    name: "Louisiana Breast & Cervical Health Program",
    number: "1-888-599-1073",
    telLink: "tel:18885991073",
    description: "Free screening and navigation for qualifying residents"
  },
  {
    name: "American Cancer Society (24/7)",
    number: "1-800-227-2345",
    telLink: "tel:18002272345",
    description: "Rides, lodging, information"
  },
  {
    name: "Patient Advocate Foundation",
    number: "1-866-512-3861",
    telLink: "tel:18665123861",
    description: "Free case management — available during diagnostic workup, before diagnosis"
  },
  {
    name: "CancerCare",
    number: "1-800-813-4673",
    telLink: "tel:18008134673",
    description: "Oncology social workers, counseling"
  },
  {
    name: "Louisiana 211",
    number: "211",
    telLink: "tel:211",
    description: "Local services in all 64 parishes"
  },
  {
    name: "Medicaid rides",
    number: null,
    telLink: null,
    description: "Call the transportation number on the back of your Medicaid card. Give about 48 hours' notice."
  }
];

export const RESOURCES_FOOTER_NOTE = "Last reviewed August 2026. Please verify current details by calling.";
