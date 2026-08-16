import { Product, LookbookStory } from '../types';

export const PRODUCTS: Product[] = [
  // --- WOMEN'S (IVORY COLLECTION) ---
  {
    id: 'matilda-01',
    slug: 'heavy-silver-chain',
    title: 'HEAVY SILVER CHAIN',
    collection: 'women',
    category: 'jewelry',
    price: 3800,
    description: "simple heavy silver chain. forged in our valley studio to rest cold on skin. solid weight that stays clean and real.",
    details: [
      'solid 925 sterling silver',
      'no nickel or synthetic coats',
      'hand finished link by link in the valley',
      'heavy solid clasp'
    ],
    mainImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
    lifestyleImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
    variants: [
      { id: 'v1', name: '16 inch', inStock: true, stock: 10 },
      { id: 'v2', name: '18 inch', inStock: true, stock: 10 },
      { id: 'v3', name: '20 inch', inStock: true, stock: 10 },
    ],
    stock_count: 30,
    isFeatured: true,
    hasVictorianFrame: true,
    material: '925 Sterling Silver'
  },
  {
    id: 'matilda-02',
    slug: 'raw-ceramic-mug',
    title: 'MORNING CLAY MUG',
    collection: 'women',
    category: 'ceramics',
    price: 1400,
    description: "thrown on the wheel for slow morning tea. holds hot brew deep in your hands on cold mountain mornings.",
    details: [
      'raw valley stoneware clay',
      'matte ivory glaze interior',
      'dishwasher safe',
      'holds about 350 ml'
    ],
    mainImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
    lifestyleImage: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1000&q=80',
    variants: [
      { id: 'v1', name: '300 ml', inStock: true, stock: 10 },
      { id: 'v2', name: '400 ml', inStock: true, stock: 10 },
    ],
    stock_count: 20,
    isFeatured: false,
    hasVictorianFrame: false,
    material: 'Raw Stoneware'
  },
  {
    id: 'matilda-03',
    slug: 'signet-ring-gold',
    title: 'SOLID EVERYDAY RING',
    collection: 'women',
    category: 'jewelry',
    price: 4900,
    description: "solid simple ring you never need to take off. smooth finish that softens over time with daily wear.",
    details: [
      'solid recycled warm gold blend',
      'flat top for quiet wear',
      'waterproof and sweatproof',
      'won\'t lose its shade over time'
    ],
    mainImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
    lifestyleImage: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80',
    variants: [
      { id: 'v1', name: 'size 6', inStock: true, stock: 8 },
      { id: 'v2', name: 'size 7', inStock: true, stock: 12 },
      { id: 'v3', name: 'size 8', inStock: true, stock: 5 },
    ],
    stock_count: 25,
    isFeatured: true,
    hasVictorianFrame: true,
    material: 'Warm Recycled Gold'
  },
  {
    id: 'matilda-04',
    slug: 'washed-linen-shirt',
    title: 'WORN-IN LINEN SHIRT',
    collection: 'women',
    category: 'apparel',
    price: 3200,
    description: "woven light flax shirt that feels like home. soft on skin, easy boxy cut for quiet indoor days or long walks.",
    details: [
      '100 percent natural flax',
      'real shell buttons',
      'relaxed easy cut',
      'washed for zero shrinkage'
    ],
    mainImage: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80',
    lifestyleImage: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80',
    variants: [
      { id: 'v1', name: 'small', inStock: true, stock: 10 },
      { id: 'v2', name: 'medium', inStock: true, stock: 15 },
      { id: 'v3', name: 'large', inStock: true, stock: 7 },
    ],
    stock_count: 32,
    isFeatured: false,
    hasVictorianFrame: false,
    material: 'Natural Woven Linen'
  },
  {
    id: 'matilda-05',
    slug: 'parchment-journal',
    title: 'HARDCOVER MEMORY LEDGER',
    collection: 'women',
    category: 'editorial',
    price: 1100,
    description: "thick cotton pages for late night ink notes. lays flat on wooden tables for simple thoughts and honest words.",
    details: [
      'thick cotton paper',
      'hard linen spine',
      'lays flat 180 degrees',
      'ribbon marker included'
    ],
    mainImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
    lifestyleImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=80',
    variants: [
      { id: 'v1', name: 'blank pages', inStock: true, stock: 20 },
      { id: 'v2', name: 'dotted pages', inStock: true, stock: 15 },
    ],
    stock_count: 35,
    isFeatured: false,
    hasVictorianFrame: true,
    material: 'Cotton Paper'
  },

  // --- MEN'S (CHARCOAL LEDGER) ---
  {
    id: 'matilda-06',
    slug: 'matte-black-ring',
    title: 'BRUISED OXIDE BAND',
    collection: 'men',
    category: 'jewelry',
    price: 3600,
    description: "solid valley silver with an oxidized dark charcoal finish. dark tone that wears in slowly like old leather boots.",
    details: [
      'solid 925 silver base',
      'hand treated sulfur patina',
      'smooth inner edge for comfort',
      'wears gently over time'
    ],
    mainImage: 'https://images.unsplash.com/photo-1622398476192-4986c42f31cc?auto=format&fit=crop&w=1000&q=80',
    lifestyleImage: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80',
    variants: [
      { id: 'v1', name: 'size 9', inStock: true, stock: 12 },
      { id: 'v2', name: 'size 10', inStock: true, stock: 10 },
      { id: 'v3', name: 'size 11', inStock: true, stock: 8 },
    ],
    stock_count: 30,
    isFeatured: true,
    hasVictorianFrame: true,
    material: 'Oxidized 925 Silver'
  },
  {
    id: 'matilda-07',
    slug: 'heavyweight-cotton-tee',
    title: 'HEAVY CHARCOAL TEE',
    collection: 'men',
    category: 'apparel',
    price: 2200,
    description: "heavy thick cotton shirt built for cold valley winds. holds its boxy fit through long days and quiet nights.",
    details: [
      'heavy weight cotton fabric',
      'firm ribbed neck collar',
      'soft garment dye finish',
      'made to last for years'
    ],
    mainImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
    lifestyleImage: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80',
    variants: [
      { id: 'v1', name: 'medium', inStock: true, stock: 14 },
      { id: 'v2', name: 'large', inStock: true, stock: 16 },
      { id: 'v3', name: 'xlarge', inStock: true, stock: 10 },
    ],
    stock_count: 40,
    isFeatured: true,
    hasVictorianFrame: false,
    material: '100% Heavy Cotton'
  },
  {
    id: 'matilda-08',
    slug: 'slate-cuff-bracelet',
    title: 'FORGED SILVER CUFF',
    collection: 'men',
    category: 'jewelry',
    price: 4500,
    description: "hammered by hand from a single thick silver bar. heavy matte texture made to rest gently around your wrist.",
    details: [
      'hammer forged solid silver',
      'brushed matte slate finish',
      '6mm solid thickness',
      'stamped with matilda mark'
    ],
    mainImage: 'https://images.unsplash.com/photo-1611591475179-be253f938d22?auto=format&fit=crop&w=1000&q=80',
    lifestyleImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80',
    variants: [
      { id: 'v1', name: 'S/M', inStock: true, stock: 9 },
      { id: 'v2', name: 'L/XL', inStock: true, stock: 11 },
    ],
    stock_count: 20,
    isFeatured: false,
    hasVictorianFrame: true,
    material: 'Forged Slate Silver'
  },
  {
    id: 'matilda-09',
    slug: 'dark-leather-keywrap',
    title: 'RAW LEATHER KEYCASE',
    collection: 'men',
    category: 'ceramics',
    price: 1250,
    description: "keeps keys quiet in your coat pockets. thick dark leather that ages deeply with daily warmth and touch.",
    details: [
      'thick full grain leather',
      'brass screw fitting',
      'holds up to 5 keys',
      'burnished simple edges'
    ],
    mainImage: 'https://images.unsplash.com/photo-1628149448255-320340915f77?auto=format&fit=crop&w=1000&q=80',
    lifestyleImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
    variants: [
      { id: 'v1', name: 'dark charcoal', inStock: true, stock: 15 },
      { id: 'v2', name: 'deep espresso', inStock: true, stock: 10 },
    ],
    stock_count: 25,
    isFeatured: false,
    hasVictorianFrame: false,
    material: 'Full Grain Leather'
  },
  {
    id: 'matilda-10',
    slug: 'analog-vinyl-press',
    title: 'SONGS FROM HOME VINYL',
    collection: 'men',
    category: 'editorial',
    price: 1800,
    description: "heavy black wax pressing. quiet acoustic tracks and soft valley rain recorded for quiet late night reading.",
    details: [
      '180 gram heavy vinyl',
      'matte paper sleeve',
      'includes small printed zine',
      'valley session recordings'
    ],
    mainImage: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?auto=format&fit=crop&w=1000&q=80',
    lifestyleImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1000&q=80',
    variants: [
      { id: 'v1', name: 'standard wax', inStock: true, stock: 18 },
    ],
    stock_count: 18,
    isFeatured: false,
    hasVictorianFrame: true,
    material: '180g Heavy Wax'
  }
];

export const LOOKBOOK_STORIES: LookbookStory[] = [
  {
    id: 'story-1',
    title: 'divine thoughts for quiet days',
    subtitle: 'volume 01 / notes from the valley',
    quote: "we keep things around because they remind us of simple mornings when the cold mountain breeze fills the quiet room.",
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1000&q=80',
    songTitle: 'valley acoustic session',
    artist: 'matilda recordings'
  },
  {
    id: 'story-2',
    title: 'songs that feel like home',
    subtitle: 'the evening notes',
    quote: "a quiet corner, warm tea in hand, and silver that stays real on your skin year after year.",
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1000&q=80',
    songTitle: 'mountain rain',
    artist: 'matilda recordings'
  }
];
