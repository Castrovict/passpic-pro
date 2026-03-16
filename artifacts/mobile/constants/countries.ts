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
  { code: "US", name: "United States", flag: "🇺🇸", widthMm: 50, heightMm: 50, widthPx: 600, heightPx: 600, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background, 2x2 inch" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White or off-white background" },
  { code: "EU", name: "European Union", flag: "🇪🇺", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "Light gray background allowed" },
  { code: "CA", name: "Canada", flag: "🇨🇦", widthMm: 50, heightMm: 70, widthPx: 591, heightPx: 826, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background, 2x2.75 inch" },
  { code: "AU", name: "Australia", flag: "🇦🇺", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "IN", name: "India", flag: "🇮🇳", widthMm: 35, heightMm: 35, widthPx: 413, heightPx: 413, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background, 35x35mm" },
  { code: "CN", name: "China", flag: "🇨🇳", widthMm: 33, heightMm: 48, widthPx: 390, heightPx: 567, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "JP", name: "Japan", flag: "🇯🇵", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "DE", name: "Germany", flag: "🇩🇪", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White or light gray" },
  { code: "FR", name: "France", flag: "🇫🇷", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "IT", name: "Italy", flag: "🇮🇹", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "ES", name: "Spain", flag: "🇪🇸", widthMm: 32, heightMm: 26, widthPx: 378, heightPx: 307, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background, 32x26mm" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", widthMm: 30, heightMm: 40, widthPx: 354, heightPx: 472, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "RU", name: "Russia", flag: "🇷🇺", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White or light background" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "AE", name: "UAE", flag: "🇦🇪", widthMm: 40, heightMm: 60, widthPx: 472, heightPx: 709, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", widthMm: 40, heightMm: 60, widthPx: 472, heightPx: 709, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White or light gray" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", widthMm: 40, heightMm: 60, widthPx: 472, heightPx: 709, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", widthMm: 35, heightMm: 50, widthPx: 413, heightPx: 591, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", widthMm: 51, heightMm: 51, widthPx: 600, heightPx: 600, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background, 2x2 inch" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", widthMm: 50, heightMm: 60, widthPx: 591, heightPx: 709, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "IR", name: "Iran", flag: "🇮🇷", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", widthMm: 45, heightMm: 35, widthPx: 531, heightPx: 413, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background, landscape" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", widthMm: 40, heightMm: 40, widthPx: 472, heightPx: 472, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "CL", name: "Chile", flag: "🇨🇱", widthMm: 32, heightMm: 32, widthPx: 378, heightPx: 378, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", widthMm: 30, heightMm: 40, widthPx: 354, heightPx: 472, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "PL", name: "Poland", flag: "🇵🇱", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White or light gray" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White or light gray" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "NO", name: "Norway", flag: "🇳🇴", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White or light background" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "GR", name: "Greece", flag: "🇬🇷", widthMm: 40, heightMm: 60, widthPx: 472, heightPx: 709, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "HU", name: "Hungary", flag: "🇭🇺", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White or light background" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "RO", name: "Romania", flag: "🇷🇴", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White or light gray" },
  { code: "IL", name: "Israel", flag: "🇮🇱", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300, backgroundColor: "#FFFFFF", notes: "White background" },
];

export const POPULAR_COUNTRIES = ["US", "UK", "EU", "CA", "AU", "IN", "JP", "CN"];
