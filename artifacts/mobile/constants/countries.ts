export interface CountryFormat {
  code: string;
  name: string;
  flag: string;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
  dpi: number;
  backgroundColor: string;
  notes: string;
}

export const COUNTRY_FORMATS: CountryFormat[] = [
  // ── NORTEAMÉRICA ──────────────────────────────────────────────
  { code: "US", name: "United States", flag: "🇺🇸", widthMm: 50, heightMm: 50, widthPx: 600, heightPx: 600, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background, 2x2 inch" },
  { code: "CA", name: "Canada", flag: "🇨🇦", widthMm: 50, heightMm: 70, widthPx: 591, heightPx: 826, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background, 2x2.75 inch" },
  { code: "MX", name: "México", flag: "🇲🇽", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },

  // ── LATINOAMÉRICA ──────────────────────────────────────────────
  { code: "AR", name: "Argentina", flag: "🇦🇷", widthMm: 40, heightMm: 40, widthPx: 472, heightPx: 472, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco, 4x4 cm" },
  { code: "BR", name: "Brasil", flag: "🇧🇷", widthMm: 30, heightMm: 40, widthPx: 354, heightPx: 472, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "CL", name: "Chile", flag: "🇨🇱", widthMm: 32, heightMm: 32, widthPx: 378, heightPx: 378, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco, 3.2x3.2 cm" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", widthMm: 30, heightMm: 40, widthPx: 354, heightPx: 472, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco, 3x4 cm" },
  { code: "PE", name: "Perú", flag: "🇵🇪", widthMm: 32, heightMm: 26, widthPx: 378, heightPx: 307, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco, 32x26 mm" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", widthMm: 30, heightMm: 40, widthPx: 354, heightPx: 472, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "CU", name: "Cuba", flag: "🇨🇺", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "DO", name: "Rep. Dominicana", flag: "🇩🇴", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "PA", name: "Panamá", flag: "🇵🇦", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷", widthMm: 50, heightMm: 50, widthPx: 600, heightPx: 600, dpi: 300, backgroundColor: "#FFFFFF", notes: "Formato USA, 2x2 inch" },
  { code: "HT", name: "Haití", flag: "🇭🇹", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "TT", name: "Trinidad y Tobago", flag: "🇹🇹", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },

  // ── EUROPA ────────────────────────────────────────────────────
  { code: "UK", name: "United Kingdom", flag: "🇬🇧", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White or off-white background" },
  { code: "EU", name: "Unión Europea", flag: "🇪🇺", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Light gray background allowed" },
  { code: "DE", name: "Alemania", flag: "🇩🇪", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco o gris claro" },
  { code: "FR", name: "Francia", flag: "🇫🇷", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "IT", name: "Italia", flag: "🇮🇹", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "ES", name: "España", flag: "🇪🇸", widthMm: 32, heightMm: 26, widthPx: 378, heightPx: 307, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco, 32x26 mm" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "NL", name: "Países Bajos", flag: "🇳🇱", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco o gris claro" },
  { code: "BE", name: "Bélgica", flag: "🇧🇪", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "CH", name: "Suiza", flag: "🇨🇭", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco o claro" },
  { code: "AT", name: "Austria", flag: "🇦🇹", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco o gris claro" },
  { code: "SE", name: "Suecia", flag: "🇸🇪", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "NO", name: "Noruega", flag: "🇳🇴", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "DK", name: "Dinamarca", flag: "🇩🇰", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "FI", name: "Finlandia", flag: "🇫🇮", widthMm: 36, heightMm: 47, widthPx: 425, heightPx: 555, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "PL", name: "Polonia", flag: "🇵🇱", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco o gris claro" },
  { code: "CZ", name: "Rep. Checa", flag: "🇨🇿", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "RO", name: "Rumania", flag: "🇷🇴", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "HU", name: "Hungría", flag: "🇭🇺", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco o claro" },
  { code: "GR", name: "Grecia", flag: "🇬🇷", widthMm: 40, heightMm: 60, widthPx: 472, heightPx: 709, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "RU", name: "Rusia", flag: "🇷🇺", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco o claro" },
  { code: "UA", name: "Ucrania", flag: "🇺🇦", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco o gris claro" },
  { code: "HR", name: "Croacia", flag: "🇭🇷", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "SK", name: "Eslovaquia", flag: "🇸🇰", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "RS", name: "Serbia", flag: "🇷🇸", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },

  // ── ORIENTE MEDIO Y NORTE DE ÁFRICA ───────────────────────────
  { code: "AE", name: "Emiratos Árabes", flag: "🇦🇪", widthMm: 40, heightMm: 60, widthPx: 472, heightPx: 709, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "SA", name: "Arabia Saudita", flag: "🇸🇦", widthMm: 40, heightMm: 60, widthPx: 472, heightPx: 709, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "TR", name: "Turquía", flag: "🇹🇷", widthMm: 50, heightMm: 60, widthPx: 591, heightPx: 709, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "IL", name: "Israel", flag: "🇮🇱", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "IR", name: "Irán", flag: "🇮🇷", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "EG", name: "Egipto", flag: "🇪🇬", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "MA", name: "Marruecos", flag: "🇲🇦", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "DZ", name: "Argelia", flag: "🇩🇿", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "TN", name: "Túnez", flag: "🇹🇳", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "JO", name: "Jordania", flag: "🇯🇴", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "IQ", name: "Irak", flag: "🇮🇶", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "QA", name: "Catar", flag: "🇶🇦", widthMm: 40, heightMm: 60, widthPx: 472, heightPx: 709, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },

  // ── ASIA ──────────────────────────────────────────────────────
  { code: "IN", name: "India", flag: "🇮🇳", widthMm: 35, heightMm: 35, widthPx: 413, heightPx: 413, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco, 35x35 mm" },
  { code: "CN", name: "China", flag: "🇨🇳", widthMm: 33, heightMm: 48, widthPx: 390, heightPx: 567, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "JP", name: "Japón", flag: "🇯🇵", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "KR", name: "Corea del Sur", flag: "🇰🇷", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "SG", name: "Singapur", flag: "🇸🇬", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "TH", name: "Tailandia", flag: "🇹🇭", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", widthMm: 40, heightMm: 60, widthPx: 472, heightPx: 709, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "MY", name: "Malasia", flag: "🇲🇾", widthMm: 35, heightMm: 50, widthPx: 413, heightPx: 591, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", widthMm: 51, heightMm: 51, widthPx: 600, heightPx: 600, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco, 2x2 inch" },
  { code: "PH", name: "Filipinas", flag: "🇵🇭", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "PK", name: "Pakistán", flag: "🇵🇰", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "BD", name: "Bangladés", flag: "🇧🇩", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "NP", name: "Nepal", flag: "🇳🇵", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "KH", name: "Camboya", flag: "🇰🇭", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "TW", name: "Taiwán", flag: "🇹🇼", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", widthMm: 40, heightMm: 50, widthPx: 472, heightPx: 591, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "MN", name: "Mongolia", flag: "🇲🇳", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },

  // ── OCEANÍA ───────────────────────────────────────────────────
  { code: "AU", name: "Australia", flag: "🇦🇺", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "NZ", name: "Nueva Zelanda", flag: "🇳🇿", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco o gris claro" },

  // ── ÁFRICA ────────────────────────────────────────────────────
  { code: "ZA", name: "Sudáfrica", flag: "🇿🇦", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "KE", name: "Kenia", flag: "🇰🇪", widthMm: 45, heightMm: 35, widthPx: 531, heightPx: 413, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco, apaisado" },
  { code: "ET", name: "Etiopía", flag: "🇪🇹", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "SN", name: "Senegal", flag: "🇸🇳", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "CI", name: "Costa de Marfil", flag: "🇨🇮", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
  { code: "CM", name: "Camerún", flag: "🇨🇲", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Fondo blanco" },
];

export const POPULAR_COUNTRIES = ["US", "MX", "CO", "AR", "VE", "EC", "PE", "DO", "CU", "CA"];
