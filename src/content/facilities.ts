export interface Facility {
  name: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  parishSlug?: string;
  types: ('mammography')[];
}

export const LOUISIANA_FACILITIES: Facility[] = [
  // Monroe / Ouachita
  {
    name: "Ochsner LSU Health Monroe Imaging Center",
    phone: "318-330-7000",
    address: "4864 Jackson St",
    city: "Monroe",
    zip: "71202",
    parishSlug: "ouachita",
    types: ["mammography"]
  },
  {
    name: "St. Francis Medical Center Women's Pavilion",
    phone: "318-966-4000",
    address: "301 Hall St",
    city: "Monroe",
    zip: "71201",
    parishSlug: "ouachita",
    types: ["mammography"]
  },
  {
    name: "Glenwood Regional Medical Center Breast Center",
    phone: "318-329-4600",
    address: "503 McMillan Rd",
    city: "West Monroe",
    zip: "71291",
    parishSlug: "ouachita",
    types: ["mammography"]
  },

  // New Orleans / Orleans
  {
    name: "Ochsner Medical Center - Women's Wellness Center",
    phone: "504-842-3000",
    address: "1514 Jefferson Hwy",
    city: "New Orleans",
    zip: "70121",
    parishSlug: "orleans",
    types: ["mammography"]
  },
  {
    name: "Touro Infirmary Breast Care Center",
    phone: "504-897-7011",
    address: "1401 Frowenfeld St",
    city: "New Orleans",
    zip: "70115",
    parishSlug: "orleans",
    types: ["mammography"]
  },
  {
    name: "LSU Health New Orleans Breast Center",
    phone: "504-568-4808",
    address: "2021 Perdido St",
    city: "New Orleans",
    zip: "70112",
    parishSlug: "orleans",
    types: ["mammography"]
  },

  // Baton Rouge / East Baton Rouge
  {
    name: "Mary Bird Perkins - Our Lady of the Lake Cancer Center",
    phone: "225-767-0847",
    address: "4950 Essen Ln",
    city: "Baton Rouge",
    zip: "70809",
    parishSlug: "east-baton-rouge",
    types: ["mammography"]
  },
  {
    name: "Baton Rouge General Breast Center",
    phone: "225-763-4000",
    address: "8585 Picardy Ave",
    city: "Baton Rouge",
    zip: "70809",
    parishSlug: "east-baton-rouge",
    types: ["mammography"]
  },
  {
    name: "Woman's Hospital Breast Imaging Center",
    phone: "225-927-8000",
    address: "100 Woman's Way",
    city: "Baton Rouge",
    zip: "70817",
    parishSlug: "east-baton-rouge",
    types: ["mammography"]
  },

  // Shreveport / Caddo & Bossier
  {
    name: "Ochsner LSU Health Shreveport Academic Medical Center",
    phone: "318-626-0000",
    address: "1541 Kings Hwy",
    city: "Shreveport",
    zip: "71103",
    parishSlug: "caddo",
    types: ["mammography"]
  },
  {
    name: "Willis-Knighton Breast Health Center",
    phone: "318-212-4000",
    address: "2600 Greenwood Rd",
    city: "Shreveport",
    zip: "71109",
    parishSlug: "caddo",
    types: ["mammography"]
  },
  {
    name: "Christus Shreveport-Bossier Health System Imaging",
    phone: "318-681-4500",
    address: "1450 E Bert Kouns Industrial Loop",
    city: "Shreveport",
    zip: "71105",
    parishSlug: "caddo",
    types: ["mammography"]
  },

  // Lafayette
  {
    name: "Ochsner Lafayette General Breast Center",
    phone: "337-289-7999",
    address: "1214 Coolidge St",
    city: "Lafayette",
    zip: "70503",
    parishSlug: "lafayette",
    types: ["mammography"]
  },
  {
    name: "Our Lady of Lourdes Women's & Children's Hospital",
    phone: "337-521-9100",
    address: "4600 Ambassador Caffery Pkwy",
    city: "Lafayette",
    zip: "70508",
    parishSlug: "lafayette",
    types: ["mammography"]
  },

  // Lake Charles / Calcasieu
  {
    name: "Christus Ochsner St. Patrick Breast Center",
    phone: "337-436-2511",
    address: "524 Dr Michael DeBakey Dr",
    city: "Lake Charles",
    zip: "70601",
    parishSlug: "calcasieu",
    types: ["mammography"]
  },
  {
    name: "Lake Charles Memorial Women's Imaging",
    phone: "337-494-3000",
    address: "1701 Oak Park Blvd",
    city: "Lake Charles",
    zip: "70601",
    parishSlug: "calcasieu",
    types: ["mammography"]
  },

  // Alexandria / Rapides
  {
    name: "Christus St. Frances Cabrini Hospital Imaging",
    phone: "318-487-1122",
    address: "3330 Masonic Dr",
    city: "Alexandria",
    zip: "71301",
    parishSlug: "rapides",
    types: ["mammography"]
  },
  {
    name: "Rapides Regional Medical Center Women's Center",
    phone: "318-769-3000",
    address: "211 4th St",
    city: "Alexandria",
    zip: "71301",
    parishSlug: "rapides",
    types: ["mammography"]
  },

  // North Shore / St. Tammany (Covington/Slidell)
  {
    name: "St. Tammany Health System Women's Pavilion",
    phone: "985-898-4000",
    address: "1202 S Tyler St",
    city: "Covington",
    zip: "70433",
    parishSlug: "st-tammany",
    types: ["mammography"]
  },
  {
    name: "Ochsner Medical Center - Northshore Breast Center",
    phone: "985-649-7070",
    address: "100 Medical Center Dr",
    city: "Slidell",
    zip: "70461",
    parishSlug: "st-tammany",
    types: ["mammography"]
  },

  // Houma / Terrebonne & Lafourche
  {
    name: "Terrebonne General Health System Women's Center",
    phone: "985-873-4141",
    address: "8166 Main St",
    city: "Houma",
    zip: "70360",
    parishSlug: "terrebonne",
    types: ["mammography"]
  },
  {
    name: "Thibodaux Regional Health System Imaging",
    phone: "985-447-5500",
    address: "602 N Acadia Rd",
    city: "Thibodaux",
    zip: "70301",
    parishSlug: "lafourche",
    types: ["mammography"]
  },

  // Ruston / Lincoln
  {
    name: "Northern Louisiana Medical Center Women's Center",
    phone: "318-254-2100",
    address: "401 E Vaughn Ave",
    city: "Ruston",
    zip: "71270",
    parishSlug: "lincoln",
    types: ["mammography"]
  },

  // Hammond / Tangipahoa
  {
    name: "North Oaks Health System Women's Pavilion",
    phone: "985-230-1000",
    address: "15790 Paul Vega MD Dr",
    city: "Hammond",
    zip: "70403",
    parishSlug: "tangipahoa",
    types: ["mammography"]
  }
];
