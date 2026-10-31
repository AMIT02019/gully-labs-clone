/**
 * ==========================================================================
 * SNEAKER SHOWCASE DATA SOURCE
 * ==========================================================================
 * Editable master product list driving both:
 *  - SECTION 1: Sneaker Collection Wall / Shop Grid (10 items)
 *  - SECTION 2: Single-Product Interactive Carousel
 *
 * Each product object contains:
 *  - id: Unique catalog identifier (links to existing cart and quick view)
 *  - code: Small-caps / monospace silhouette code (e.g., "GL-001 // BAAZ 01")
 *  - name: Sneaker model title
 *  - colour: Colorway description
 *  - price: Numeric price value in INR (e.g. 4290)
 *  - image: Side-on profile photograph URL or path
 *  - sizes: Array of available sizes
 *  - altText: Descriptive alt text for accessibility and SEO
 */

const SNEAKER_SHOWCASE_PRODUCTS = [
  {
    id: "prod-001",
    code: "GL-001 // BAAZ 01",
    name: "Baaz Faris Black",
    colour: "Black / Tumble White",
    price: 4290,
    image: "assets/images/img_001_d54b9d76.jpeg",
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    altText: "Lateral side-on profile view of Gully Number 001 Baaz Faris Black hand-lasted Indian sneaker"
  },
  {
    id: "prod-002",
    code: "GL-001 // RAGA 02",
    name: "Aandhi Kobicha",
    colour: "Kobicha Earth / Sienna Tan",
    price: 5990,
    image: "assets/images/img_002_5983bf7c.jpeg",
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    altText: "Lateral side-on profile view of Gully Number 001 x Raga Aandhi Kobicha earth suede sneaker"
  },
  {
    id: "prod-003",
    code: "GL-001 // INDR 03",
    name: "Baaz Indrani Edition",
    colour: "Indrani Celestial Blue / Ivory",
    price: 5990,
    image: "assets/images/img_003_5cfa92d1.jpeg",
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    altText: "Lateral side-on profile view of Gully Number 001 Baaz Indrani Edition celestial blue hand-burnished sneaker"
  },
  {
    id: "prod-004",
    code: "GL-001 // LELA 04",
    name: "Baaz Leila Navy",
    colour: "Leila Navy / Slate Grey",
    price: 4290,
    image: "assets/images/img_006_8fd2d838.jpeg",
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    altText: "Lateral side-on profile view of Gully Number 001 Baaz Leila Navy full-grain leather sneaker"
  },
  {
    id: "prod-005",
    code: "GL-001 // ARYN 05",
    name: "Buransh Red",
    colour: "Buransh Red / Ecru Cream",
    price: 5990,
    image: "assets/images/img_007_97e07d5b.jpeg",
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    altText: "Lateral side-on profile view of Gully Number 001 x Aryan Katoch Buransh Red suede sneaker"
  },
  {
    id: "prod-006",
    code: "GL-001 // NOOR 06",
    name: "Baaz Noor Yellow",
    colour: "Noor Yellow / Chalk White",
    price: 4290,
    image: "assets/images/img_005_de05f1f9.jpeg",
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    altText: "Lateral side-on profile view of Gully Number 001 Baaz Noor Yellow hand-lasted sneaker"
  },
  {
    id: "prod-007",
    code: "GL-001 // FLTR 07",
    name: "Baaz Filter Brown",
    colour: "Filter Brown / Roast Espresso",
    price: 4490,
    image: "assets/images/img_082_ddab48c9.jpeg",
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    altText: "Lateral side-on profile view of Gully Number 001 Baaz Filter Brown rich patina sneaker"
  },
  {
    id: "prod-008",
    code: "GL-001 // BTTR 08",
    name: "Baaz Bitter Black",
    colour: "Bitter Black / Charcoal",
    price: 4490,
    image: "assets/images/img_083_7078dc96.jpeg",
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    altText: "Lateral side-on profile view of Gully Number 001 Baaz Bitter Black monochromatic street sneaker"
  },
  {
    id: "prod-009",
    code: "GL-001 // RKHE 09",
    name: "Rekhe Brown",
    colour: "Rekhe Ochre / Vintage Chestnut",
    price: 8990,
    image: "assets/images/img_084_a9b39775.jpeg",
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    altText: "Lateral side-on profile view of Gully Number 001 Rekhe Brown archival heritage sneaker"
  },
  {
    id: "prod-010",
    code: "GL-001 // KHRF 10",
    name: "Kharif Green",
    colour: "Kharif Green / Sage Parchment",
    price: 6990,
    image: "assets/images/img_085_d00da94f.jpeg",
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    altText: "Lateral side-on profile view of Gully Number 001 Kharif Green artisanal sneaker"
  }
];

// Expose globally for both vanilla scripts and module bundlers
if (typeof window !== 'undefined') {
  window.SNEAKER_SHOWCASE_PRODUCTS = SNEAKER_SHOWCASE_PRODUCTS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SNEAKER_SHOWCASE_PRODUCTS };
}
