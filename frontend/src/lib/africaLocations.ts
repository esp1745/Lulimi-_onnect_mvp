/**
 * African countries and their major cities, used by the onboarding location
 * pickers. Lulimi is an African-language marketplace, so the country list is
 * deliberately limited to Africa.
 */
export interface AfricanCountry {
  name: string;
  flag: string;
  cities: string[];
}

export const AFRICAN_COUNTRIES: AfricanCountry[] = [
  { name: "Algeria", flag: "🇩🇿", cities: ["Algiers", "Oran", "Constantine", "Annaba"] },
  { name: "Angola", flag: "🇦🇴", cities: ["Luanda", "Huambo", "Lobito", "Benguela"] },
  { name: "Benin", flag: "🇧🇯", cities: ["Cotonou", "Porto-Novo", "Parakou"] },
  { name: "Botswana", flag: "🇧🇼", cities: ["Gaborone", "Francistown", "Maun", "Kasane"] },
  { name: "Burkina Faso", flag: "🇧🇫", cities: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou"] },
  { name: "Burundi", flag: "🇧🇮", cities: ["Bujumbura", "Gitega", "Ngozi"] },
  { name: "Cabo Verde", flag: "🇨🇻", cities: ["Praia", "Mindelo", "Santa Maria"] },
  { name: "Cameroon", flag: "🇨🇲", cities: ["Douala", "Yaoundé", "Bamenda", "Bafoussam"] },
  { name: "Central African Republic", flag: "🇨🇫", cities: ["Bangui", "Bimbo", "Berbérati"] },
  { name: "Chad", flag: "🇹🇩", cities: ["N'Djamena", "Moundou", "Sarh"] },
  { name: "Comoros", flag: "🇰🇲", cities: ["Moroni", "Mutsamudu"] },
  { name: "Democratic Republic of the Congo", flag: "🇨🇩", cities: ["Kinshasa", "Lubumbashi", "Goma", "Mbuji-Mayi", "Bukavu"] },
  { name: "Republic of the Congo", flag: "🇨🇬", cities: ["Brazzaville", "Pointe-Noire", "Dolisie"] },
  { name: "Côte d'Ivoire", flag: "🇨🇮", cities: ["Abidjan", "Yamoussoukro", "Bouaké", "San-Pédro"] },
  { name: "Djibouti", flag: "🇩🇯", cities: ["Djibouti City", "Ali Sabieh"] },
  { name: "Egypt", flag: "🇪🇬", cities: ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan"] },
  { name: "Equatorial Guinea", flag: "🇬🇶", cities: ["Malabo", "Bata"] },
  { name: "Eritrea", flag: "🇪🇷", cities: ["Asmara", "Keren", "Massawa"] },
  { name: "Eswatini", flag: "🇸🇿", cities: ["Mbabane", "Manzini", "Lobamba"] },
  { name: "Ethiopia", flag: "🇪🇹", cities: ["Addis Ababa", "Dire Dawa", "Bahir Dar", "Mekelle", "Hawassa"] },
  { name: "Gabon", flag: "🇬🇦", cities: ["Libreville", "Port-Gentil", "Franceville"] },
  { name: "Gambia", flag: "🇬🇲", cities: ["Banjul", "Serrekunda", "Brikama"] },
  { name: "Ghana", flag: "🇬🇭", cities: ["Accra", "Kumasi", "Tamale", "Takoradi", "Cape Coast"] },
  { name: "Guinea", flag: "🇬🇳", cities: ["Conakry", "Nzérékoré", "Kankan"] },
  { name: "Guinea-Bissau", flag: "🇬🇼", cities: ["Bissau", "Bafatá"] },
  { name: "Kenya", flag: "🇰🇪", cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"] },
  { name: "Lesotho", flag: "🇱🇸", cities: ["Maseru", "Teyateyaneng", "Leribe"] },
  { name: "Liberia", flag: "🇱🇷", cities: ["Monrovia", "Gbarnga", "Buchanan"] },
  { name: "Libya", flag: "🇱🇾", cities: ["Tripoli", "Benghazi", "Misrata"] },
  { name: "Madagascar", flag: "🇲🇬", cities: ["Antananarivo", "Toamasina", "Mahajanga"] },
  { name: "Malawi", flag: "🇲🇼", cities: ["Lilongwe", "Blantyre", "Mzuzu", "Zomba"] },
  { name: "Mali", flag: "🇲🇱", cities: ["Bamako", "Sikasso", "Mopti", "Timbuktu"] },
  { name: "Mauritania", flag: "🇲🇷", cities: ["Nouakchott", "Nouadhibou"] },
  { name: "Mauritius", flag: "🇲🇺", cities: ["Port Louis", "Curepipe", "Quatre Bornes"] },
  { name: "Morocco", flag: "🇲🇦", cities: ["Casablanca", "Rabat", "Marrakesh", "Fez", "Tangier"] },
  { name: "Mozambique", flag: "🇲🇿", cities: ["Maputo", "Beira", "Nampula", "Matola"] },
  { name: "Namibia", flag: "🇳🇦", cities: ["Windhoek", "Walvis Bay", "Swakopmund", "Oshakati"] },
  { name: "Niger", flag: "🇳🇪", cities: ["Niamey", "Zinder", "Maradi"] },
  { name: "Nigeria", flag: "🇳🇬", cities: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Enugu", "Benin City"] },
  { name: "Rwanda", flag: "🇷🇼", cities: ["Kigali", "Butare", "Gisenyi", "Musanze"] },
  { name: "São Tomé and Príncipe", flag: "🇸🇹", cities: ["São Tomé"] },
  { name: "Senegal", flag: "🇸🇳", cities: ["Dakar", "Thiès", "Saint-Louis", "Ziguinchor"] },
  { name: "Seychelles", flag: "🇸🇨", cities: ["Victoria"] },
  { name: "Sierra Leone", flag: "🇸🇱", cities: ["Freetown", "Bo", "Kenema"] },
  { name: "Somalia", flag: "🇸🇴", cities: ["Mogadishu", "Hargeisa", "Kismayo"] },
  { name: "South Africa", flag: "🇿🇦", cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Gqeberha", "Bloemfontein"] },
  { name: "South Sudan", flag: "🇸🇸", cities: ["Juba", "Wau", "Malakal"] },
  { name: "Sudan", flag: "🇸🇩", cities: ["Khartoum", "Omdurman", "Port Sudan"] },
  { name: "Tanzania", flag: "🇹🇿", cities: ["Dar es Salaam", "Dodoma", "Arusha", "Mwanza", "Zanzibar City"] },
  { name: "Togo", flag: "🇹🇬", cities: ["Lomé", "Sokodé", "Kara"] },
  { name: "Tunisia", flag: "🇹🇳", cities: ["Tunis", "Sfax", "Sousse"] },
  { name: "Uganda", flag: "🇺🇬", cities: ["Kampala", "Gulu", "Mbarara", "Jinja", "Entebbe"] },
  { name: "Zambia", flag: "🇿🇲", cities: ["Lusaka", "Kitwe", "Ndola", "Livingstone", "Chipata", "Kabwe", "Solwezi"] },
  { name: "Zimbabwe", flag: "🇿🇼", cities: ["Harare", "Bulawayo", "Mutare", "Gweru", "Victoria Falls"] },
];

export function citiesForCountry(country: string): string[] {
  return AFRICAN_COUNTRIES.find((c) => c.name === country)?.cities ?? [];
}
