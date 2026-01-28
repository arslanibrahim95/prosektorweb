/**
 * Turkey Geographic Data for OSGB Local SEO
 *
 * 81 il, 922 ilce ve komsu il iliskileri
 * Her OSGB kendi ili + komsu illere hizmet verebilir
 */

export interface District {
  name: string;
  slug: string;
  population?: number;
  isCenter?: boolean; // Merkez ilce mi?
}

export interface Province {
  id: number; // Plaka kodu
  name: string;
  slug: string;
  region: TurkeyRegion;
  neighbors: number[]; // Komsu il plaka kodlari
  districts: District[];
  population?: number;
  dangerClass?: "az_tehlikeli" | "tehlikeli" | "cok_tehlikeli"; // Bolgedeki agirlikli tehlike sinifi
}

export type TurkeyRegion =
  | "marmara"
  | "ege"
  | "akdeniz"
  | "ic_anadolu"
  | "karadeniz"
  | "dogu_anadolu"
  | "guneydogu_anadolu";

/**
 * Turkiye Il ve Komsu Verileri
 * Plaka koduna gore siralanmis
 */
export const TURKEY_PROVINCES: Province[] = [
  {
    id: 1,
    name: "Adana",
    slug: "adana",
    region: "akdeniz",
    neighbors: [31, 33, 38, 46, 80], // Hatay, Mersin, Kayseri, K.Maras, Osmaniye
    districts: [
      { name: "Seyhan", slug: "seyhan", isCenter: true },
      { name: "Cukurova", slug: "cukurova", isCenter: true },
      { name: "Yuregir", slug: "yuregir", isCenter: true },
      { name: "Sarıcam", slug: "saricam", isCenter: true },
      { name: "Ceyhan", slug: "ceyhan" },
      { name: "Kozan", slug: "kozan" },
      { name: "Imamoglu", slug: "imamoglu" },
      { name: "Karaisalı", slug: "karaisali" },
      { name: "Karatas", slug: "karatas" },
      { name: "Pozantı", slug: "pozanti" },
      { name: "Saimbeyli", slug: "saimbeyli" },
      { name: "Tufanbeyli", slug: "tufanbeyli" },
      { name: "Yumurtalık", slug: "yumurtalik" },
      { name: "Aladağ", slug: "aladag" },
      { name: "Feke", slug: "feke" },
    ],
  },
  {
    id: 6,
    name: "Ankara",
    slug: "ankara",
    region: "ic_anadolu",
    neighbors: [3, 5, 18, 26, 40, 42, 43, 71], // Afyon, Amasya, Cankiri, Eskisehir, Kırıkkale, Konya, Kutahya, Kırıkkale
    districts: [
      { name: "Cankaya", slug: "cankaya", isCenter: true },
      { name: "Kecioren", slug: "kecioren", isCenter: true },
      { name: "Mamak", slug: "mamak", isCenter: true },
      { name: "Yenimahalle", slug: "yenimahalle", isCenter: true },
      { name: "Etimesgut", slug: "etimesgut", isCenter: true },
      { name: "Sincan", slug: "sincan", isCenter: true },
      { name: "Altındağ", slug: "altindag", isCenter: true },
      { name: "Pursaklar", slug: "pursaklar", isCenter: true },
      { name: "Polatli", slug: "polatli" },
      { name: "Cubuk", slug: "cubuk" },
      { name: "Beypazari", slug: "beypazari" },
      { name: "Haymana", slug: "haymana" },
      { name: "Sereflikochisar", slug: "sereflikochisar" },
      { name: "Ayas", slug: "ayas" },
      { name: "Bala", slug: "bala" },
      { name: "Camlidere", slug: "camlidere" },
      { name: "Elmadag", slug: "elmadag" },
      { name: "Evren", slug: "evren" },
      { name: "Golbasi", slug: "golbasi" },
      { name: "Gudul", slug: "gudul" },
      { name: "Kahramankazan", slug: "kahramankazan" },
      { name: "Kalecik", slug: "kalecik" },
      { name: "Kizilcahamam", slug: "kizilcahamam" },
      { name: "Nallihan", slug: "nallihan" },
      { name: "Akyurt", slug: "akyurt" },
    ],
  },
  {
    id: 34,
    name: "Istanbul",
    slug: "istanbul",
    region: "marmara",
    neighbors: [41, 59], // Kocaeli, Tekirdag
    districts: [
      { name: "Kadıkoy", slug: "kadikoy", isCenter: true },
      { name: "Besiktas", slug: "besiktas", isCenter: true },
      { name: "Sisli", slug: "sisli", isCenter: true },
      { name: "Fatih", slug: "fatih", isCenter: true },
      { name: "Uskudar", slug: "uskudar", isCenter: true },
      { name: "Beyoglu", slug: "beyoglu", isCenter: true },
      { name: "Umraniye", slug: "umraniye" },
      { name: "Bagcilar", slug: "bagcilar" },
      { name: "Bahcelievler", slug: "bahcelievler" },
      { name: "Bakirkoy", slug: "bakirkoy" },
      { name: "Maltepe", slug: "maltepe" },
      { name: "Kartal", slug: "kartal" },
      { name: "Pendik", slug: "pendik" },
      { name: "Tuzla", slug: "tuzla" },
      { name: "Atasehir", slug: "atasehir" },
      { name: "Sancaktepe", slug: "sancaktepe" },
      { name: "Sultanbeyli", slug: "sultanbeyli" },
      { name: "Cekmekoy", slug: "cekmekoy" },
      { name: "Beykoz", slug: "beykoz" },
      { name: "Sile", slug: "sile" },
      { name: "Avcilar", slug: "avcilar" },
      { name: "Kucukcekmece", slug: "kucukcekmece" },
      { name: "Buyukcekmece", slug: "buyukcekmece" },
      { name: "Basaksehir", slug: "basaksehir" },
      { name: "Esenyurt", slug: "esenyurt" },
      { name: "Beylikduzu", slug: "beylikduzu" },
      { name: "Arnavutkoy", slug: "arnavutkoy" },
      { name: "Catalca", slug: "catalca" },
      { name: "Silivri", slug: "silivri" },
      { name: "Esenler", slug: "esenler" },
      { name: "Gungoren", slug: "gungoren" },
      { name: "Zeytinburnu", slug: "zeytinburnu" },
      { name: "Bayrampaşa", slug: "bayrampasa" },
      { name: "Eyupsultan", slug: "eyupsultan" },
      { name: "Gaziosmanpasa", slug: "gaziosmanpasa" },
      { name: "Kagithane", slug: "kagithane" },
      { name: "Sariyer", slug: "sariyer" },
      { name: "Sultangazı", slug: "sultangazi" },
      { name: "Adalar", slug: "adalar" },
    ],
  },
  {
    id: 35,
    name: "Izmir",
    slug: "izmir",
    region: "ege",
    neighbors: [9, 20, 45, 64], // Aydin, Denizli, Manisa, Usak
    districts: [
      { name: "Konak", slug: "konak", isCenter: true },
      { name: "Karsıyaka", slug: "karsiyaka", isCenter: true },
      { name: "Bornova", slug: "bornova", isCenter: true },
      { name: "Buca", slug: "buca", isCenter: true },
      { name: "Cigli", slug: "cigli", isCenter: true },
      { name: "Bayrakli", slug: "bayrakli", isCenter: true },
      { name: "Karabaglar", slug: "karabaglar", isCenter: true },
      { name: "Gaziemir", slug: "gaziemir", isCenter: true },
      { name: "Narlidere", slug: "narlidere", isCenter: true },
      { name: "Balcova", slug: "balcova", isCenter: true },
      { name: "Guzelbahce", slug: "guzelbahce", isCenter: true },
      { name: "Aliaga", slug: "aliaga" },
      { name: "Bergama", slug: "bergama" },
      { name: "Cesme", slug: "cesme" },
      { name: "Dikili", slug: "dikili" },
      { name: "Foca", slug: "foca" },
      { name: "Karaburun", slug: "karaburun" },
      { name: "Kemalpasa", slug: "kemalpasa" },
      { name: "Kinik", slug: "kinik" },
      { name: "Kiraz", slug: "kiraz" },
      { name: "Menderes", slug: "menderes" },
      { name: "Menemen", slug: "menemen" },
      { name: "Odemis", slug: "odemis" },
      { name: "Seferihisar", slug: "seferihisar" },
      { name: "Selcuk", slug: "selcuk" },
      { name: "Tire", slug: "tire" },
      { name: "Torbali", slug: "torbali" },
      { name: "Urla", slug: "urla" },
      { name: "Beydag", slug: "beydag" },
    ],
  },
  {
    id: 41,
    name: "Kocaeli",
    slug: "kocaeli",
    region: "marmara",
    neighbors: [11, 16, 34, 54, 77], // Bilecik, Bursa, Istanbul, Sakarya, Yalova
    districts: [
      { name: "Izmit", slug: "izmit", isCenter: true },
      { name: "Gebze", slug: "gebze" },
      { name: "Darica", slug: "darica" },
      { name: "Dilovasi", slug: "dilovasi" },
      { name: "Cayirova", slug: "cayirova" },
      { name: "Basiskele", slug: "basiskele" },
      { name: "Kartepe", slug: "kartepe" },
      { name: "Golcuk", slug: "golcuk" },
      { name: "Kandira", slug: "kandira" },
      { name: "Karamursel", slug: "karamursel" },
      { name: "Korfez", slug: "korfez" },
      { name: "Derince", slug: "derince" },
    ],
  },
  {
    id: 16,
    name: "Bursa",
    slug: "bursa",
    region: "marmara",
    neighbors: [10, 11, 41, 43, 77], // Balıkesir, Bilecik, Kocaeli, Kutahya, Yalova
    districts: [
      { name: "Osmangazi", slug: "osmangazi", isCenter: true },
      { name: "Nilufer", slug: "nilufer", isCenter: true },
      { name: "Yildirim", slug: "yildirim", isCenter: true },
      { name: "Inegol", slug: "inegol" },
      { name: "Gemlik", slug: "gemlik" },
      { name: "Mudanya", slug: "mudanya" },
      { name: "Gursu", slug: "gursu" },
      { name: "Kestel", slug: "kestel" },
      { name: "Karacabey", slug: "karacabey" },
      { name: "Mustafakemalpasa", slug: "mustafakemalpasa" },
      { name: "Orhangazi", slug: "orhangazi" },
      { name: "Iznik", slug: "iznik" },
      { name: "Yenisehir", slug: "yenisehir" },
      { name: "Orhaneli", slug: "orhaneli" },
      { name: "Keles", slug: "keles" },
      { name: "Harmancik", slug: "harmancik" },
      { name: "Buyukorhan", slug: "buyukorhan" },
    ],
  },
  // TODO: Diger 75 il eklenecek - simdilik en onemli iller
];

/**
 * Plaka koduna gore il bul
 */
export function getProvinceById(id: number): Province | undefined {
  return TURKEY_PROVINCES.find((p) => p.id === id);
}

/**
 * Slug'a gore il bul
 */
export function getProvinceBySlug(slug: string): Province | undefined {
  return TURKEY_PROVINCES.find((p) => p.slug === slug);
}

/**
 * Bir ilin komsu illerini getir
 */
export function getNeighborProvinces(provinceId: number): Province[] {
  const province = getProvinceById(provinceId);
  if (!province) return [];

  return province.neighbors
    .map((id) => getProvinceById(id))
    .filter((p): p is Province => p !== undefined);
}

/**
 * Bir OSGB'nin hizmet verebilecegi tum illeri getir
 * (Kendi ili + komsu iller)
 */
export function getServiceAreaProvinces(provinceId: number): Province[] {
  const province = getProvinceById(provinceId);
  if (!province) return [];

  const neighbors = getNeighborProvinces(provinceId);
  return [province, ...neighbors];
}

/**
 * Bir OSGB'nin hizmet verebilecegi tum ilceleri getir
 */
export function getServiceAreaDistricts(provinceId: number): {
  province: Province;
  districts: District[];
}[] {
  const serviceArea = getServiceAreaProvinces(provinceId);

  return serviceArea.map((province) => ({
    province,
    districts: province.districts,
  }));
}

/**
 * Toplam sayfa sayisini hesapla
 * (Il sayfalari + ilce sayfalari)
 */
export function calculateTotalPages(provinceId: number): {
  provincePages: number;
  districtPages: number;
  total: number;
} {
  const serviceArea = getServiceAreaProvinces(provinceId);

  const provincePages = serviceArea.length;
  const districtPages = serviceArea.reduce(
    (sum, p) => sum + p.districts.length,
    0
  );

  return {
    provincePages,
    districtPages,
    total: provincePages + districtPages,
  };
}

/**
 * Bolgeye gore illeri getir
 */
export function getProvincesByRegion(region: TurkeyRegion): Province[] {
  return TURKEY_PROVINCES.filter((p) => p.region === region);
}

/**
 * Tum illeri getir
 */
export function getAllProvinces(): Province[] {
  return TURKEY_PROVINCES;
}

/**
 * Sanayi yogunluguna gore sirala (tehlike sinifi baz alinarak)
 */
export function getIndustrialProvinces(): Province[] {
  // Sanayi yogun iller - oncelikli SEO hedefi
  const industrialIds = [
    34, // Istanbul
    41, // Kocaeli
    16, // Bursa
    35, // Izmir
    6,  // Ankara
    1,  // Adana
    42, // Konya
    26, // Eskisehir
    33, // Mersin
    27, // Gaziantep
  ];

  return industrialIds
    .map((id) => getProvinceById(id))
    .filter((p): p is Province => p !== undefined);
}
