/**
 * Seed script for Joe Street Cafe menu data.
 *
 * Usage:
 *   npx tsx src/scripts/seedMenu.ts
 *
 * Seeds 55 items across 15 categories (including Pitcher).
 * Prices may need verification against updated-menu.pdf.
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCNL26vAEm5NxVHRZ1YVDz1T26HsZYycAQ",
  authDomain: "brandserps-demo.firebaseapp.com",
  projectId: "brandserps-demo",
  storageBucket: "brandserps-demo.appspot.com",
  messagingSenderId: "931055495274",
  appId: "1:931055495274:web:ba22bffe1b9575311c8213",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'joes-pos');

// ---------- Types (inline for standalone script) ----------

interface CategorySeed {
  name: string;
  displayOrder: number;
  icon: string;
  isActive: boolean;
  defaultStation: 'prep' | 'kitchen';
  description?: string;
}

interface MenuItemSeed {
  name: string;
  categoryId: string;
  basePrice: number;
  description?: string;
  variants: { name: string; priceAdd: number }[];
  isAvailable: boolean;
  station: 'prep' | 'kitchen';
}

interface AddOnGroupSeed {
  name: string;
  applicableCategories: string[];
  items: { name: string; price: number }[];
}

// ---------- Category definitions (15 categories) ----------

const categories: CategorySeed[] = [
  { name: 'Coffee - Hot', displayOrder: 1, icon: 'coffee', isActive: true, defaultStation: 'prep' },
  { name: 'Coffee - Iced', displayOrder: 2, icon: 'coffee', isActive: true, defaultStation: 'prep' },
  { name: 'Chocolates - Hot', displayOrder: 3, icon: 'cafe', isActive: true, defaultStation: 'prep' },
  { name: 'Chocolates - Iced', displayOrder: 4, icon: 'cafe', isActive: true, defaultStation: 'prep' },
  { name: 'Milk Teas - Classics', displayOrder: 5, icon: 'beverage', isActive: true, defaultStation: 'prep' },
  { name: 'Milk Teas - Mango Series', displayOrder: 6, icon: 'beverage', isActive: true, defaultStation: 'prep' },
  { name: 'Milk Teas - Matcha Series', displayOrder: 7, icon: 'beverage', isActive: true, defaultStation: 'prep' },
  { name: 'Street Fizz', displayOrder: 8, icon: 'bar', isActive: true, defaultStation: 'prep' },
  { name: 'Pastas', displayOrder: 9, icon: 'dinner', isActive: true, defaultStation: 'kitchen' },
  { name: 'Noodle Corner', displayOrder: 10, icon: 'ramen', isActive: true, defaultStation: 'kitchen' },
  { name: 'Sandwiches', displayOrder: 11, icon: 'lunch', isActive: true, defaultStation: 'kitchen' },
  { name: 'Barkada Favorites', displayOrder: 12, icon: 'dinner', isActive: true, defaultStation: 'kitchen' },
  { name: 'Pitcher', displayOrder: 13, icon: 'bar', isActive: true, defaultStation: 'prep' },
  { name: 'Street Bites', displayOrder: 14, icon: 'fastfood', isActive: true, defaultStation: 'kitchen' },
];

// Menu items grouped by category index
const menuItemsByCategory: Record<number, Omit<MenuItemSeed, 'categoryId' | 'station' | 'isAvailable'>[]> = {
  // 0: Coffee - Hot (4 items)
  0: [
    { name: 'Brewed Coffee', basePrice: 59, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Americano', basePrice: 79, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Cafe Latte', basePrice: 89, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Salted Caramel', basePrice: 99, variants: [{ name: 'Regular', priceAdd: 0 }] },
  ],
  // 1: Coffee - Iced (5 items)
  1: [
    { name: 'Iced Americano', basePrice: 89, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Greek Frappe', basePrice: 99, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Iced Latte', basePrice: 89, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Iced Dalgona', basePrice: 99, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Iced Caramel Macchiato', basePrice: 109, variants: [{ name: 'Regular', priceAdd: 0 }] },
  ],
  // 2: Chocolates - Hot (2 items)
  2: [
    { name: 'Hot Chocolate', basePrice: 65, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Hot Mocha', basePrice: 69, variants: [{ name: 'Regular', priceAdd: 0 }] },
  ],
  // 3: Chocolates - Iced (4 items)
  3: [
    { name: 'Iced Chocolate', basePrice: 89, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Iced Chocolate Latte', basePrice: 99, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Iced Chocolate Oreo', basePrice: 109, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Iced Chocolate Strawberry', basePrice: 115, variants: [{ name: 'Regular', priceAdd: 0 }] },
  ],
  // 4: Milk Teas - Classics (4 items)
  4: [
    { name: 'Wintermelon', basePrice: 75, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Okinawa', basePrice: 89, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Taro', basePrice: 79, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Cookies & Cream', basePrice: 99, variants: [{ name: 'Regular', priceAdd: 0 }] },
  ],
  // 5: Milk Teas - Mango Series (6 items)
  5: [
    { name: 'Mango', basePrice: 95, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Iced Chocolate Mango', basePrice: 99, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Iced Mango Coffee', basePrice: 109, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Mang-Berry Cloud', basePrice: 69, variants: [{ name: 'Regular', priceAdd: 0 }], description: 'Buy 1 Take 1' },
    { name: 'Mango Passion Fruit Cloud', basePrice: 69, variants: [{ name: 'Regular', priceAdd: 0 }], description: 'Buy 1 Take 1' },
    { name: 'Mango Strawberry', basePrice: 109, variants: [{ name: 'Regular', priceAdd: 0 }] },
  ],
  // 6: Milk Teas - Matcha Series (4 items)
  6: [
    { name: 'Matcha', basePrice: 99, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Dirty Matcha', basePrice: 99, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Matcha Mango', basePrice: 109, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Matcha Strawberry', basePrice: 109, variants: [{ name: 'Regular', priceAdd: 0 }] },
  ],
  // 7: Street Fizz (10 items)
  7: [
    { name: 'Berry Sunset', basePrice: 69, variants: [{ name: '12oz', priceAdd: 0 }, { name: '16oz', priceAdd: 10 }] },
    { name: 'Calamansi Spark', basePrice: 69, variants: [{ name: '12oz', priceAdd: 0 }, { name: '16oz', priceAdd: 10 }] },
    { name: 'Cucumber Breeze', basePrice: 69, variants: [{ name: '12oz', priceAdd: 0 }, { name: '16oz', priceAdd: 10 }] },
    { name: 'Guava Fizz', basePrice: 69, variants: [{ name: '12oz', priceAdd: 0 }, { name: '16oz', priceAdd: 10 }] },
    { name: 'Lychee Fizz', basePrice: 69, variants: [{ name: '12oz', priceAdd: 0 }, { name: '16oz', priceAdd: 10 }] },
    { name: 'Mango Sunset', basePrice: 69, variants: [{ name: '12oz', priceAdd: 0 }, { name: '16oz', priceAdd: 10 }] },
    { name: 'Passion Citrus Punch', basePrice: 69, variants: [{ name: '12oz', priceAdd: 0 }, { name: '16oz', priceAdd: 10 }] },
    { name: 'Strawberry Citrus Fizz', basePrice: 69, variants: [{ name: '12oz', priceAdd: 0 }, { name: '16oz', priceAdd: 10 }] },
    { name: 'Strawberry Sunset', basePrice: 69, variants: [{ name: '12oz', priceAdd: 0 }, { name: '16oz', priceAdd: 10 }] },
    { name: 'Tropical Sunset', basePrice: 69, variants: [{ name: '12oz', priceAdd: 0 }, { name: '16oz', priceAdd: 10 }] },
  ],
  // 8: Pastas (2 items)
  8: [
    { name: 'Garlic Tuna Penne', basePrice: 139, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Chicken Tomato Penne', basePrice: 149, variants: [{ name: 'Regular', priceAdd: 0 }] },
  ],
  // 9: Noodle Corner (4 items)
  9: [
    { name: 'Jjajangmyeon', basePrice: 99, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Kimchi Ramen', basePrice: 149, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Buldak Cheese', basePrice: 179, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Pancit Canton Combo', basePrice: 99, variants: [{ name: 'Regular', priceAdd: 0 }] },
  ],
  // 10: Sandwiches (3 items)
  10: [
    { name: 'Egg & Toast', basePrice: 59, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Egg Sandwich', basePrice: 69, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Ham & Egg Sandwich', basePrice: 89, variants: [{ name: 'Regular', priceAdd: 0 }] },
  ],
  // 11: Barkada Favorites (2 items)
  11: [
    { name: 'Pinoy Barkada Platter', basePrice: 429, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'K-Barkada Platter', basePrice: 399, variants: [{ name: 'Regular', priceAdd: 0 }] },
  ],
  // 12: Pitcher (2 items)
  12: [
    { name: 'Cucumber Cooler Pitcher', basePrice: 99, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Mango Cooler Pitcher', basePrice: 99, variants: [{ name: 'Regular', priceAdd: 0 }] },
  ],
  // 13: Street Bites (3 items)
  13: [
    { name: 'French Fries (Solo)', basePrice: 69, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'French Fries (Large)', basePrice: 99, variants: [{ name: 'Regular', priceAdd: 0 }] },
    { name: 'Street Bites Platter', basePrice: 125, variants: [{ name: 'Regular', priceAdd: 0 }] },
  ],
};

// ---------- Seed function ----------

async function seed() {
  console.log('Starting seed... (55 items across 14 categories)');

  // 1. Seed categories and collect their IDs
  const categoryIds: string[] = [];
  for (const cat of categories) {
    const docRef = await addDoc(collection(db, 'categories'), cat);
    categoryIds.push(docRef.id);
    console.log(`  Category: ${cat.name} -> ${docRef.id}`);
  }

  // 2. Seed menu items
  let totalItems = 0;
  for (let i = 0; i < categories.length; i++) {
    const items = menuItemsByCategory[i] ?? [];
    const station = categories[i].defaultStation;
    const categoryId = categoryIds[i];

    for (const item of items) {
      const menuItem: Omit<MenuItemSeed, 'categoryId' | 'station' | 'isAvailable'> & {
        categoryId: string;
        station: 'prep' | 'kitchen';
        isAvailable: boolean;
      } = {
        ...item,
        categoryId,
        station,
        isAvailable: true,
      };
      const docRef = await addDoc(collection(db, 'menuItems'), menuItem);
      console.log(`    Item: ${item.name} -> ${docRef.id}`);
      totalItems++;
    }
  }
  console.log(`  Total items seeded: ${totalItems}`);

  // 3. Seed add-on groups
  const noodleCornerId = categoryIds[9]; // Noodle Corner is index 9
  const addOnGroups: AddOnGroupSeed[] = [
    {
      name: 'Noodle Add-ons',
      applicableCategories: [noodleCornerId],
      items: [
        { name: 'Extra Egg', price: 15 },
        { name: 'Cheese Slice', price: 20 },
        { name: 'Fish Cake', price: 25 },
        { name: 'Spam Slice', price: 30 },
        { name: 'Fish Tofu', price: 20 },
        { name: 'Siomai', price: 20 },
        { name: 'Squid Balls', price: 15 },
      ],
    },
  ];

  for (const group of addOnGroups) {
    const docRef = await addDoc(collection(db, 'addOnGroups'), group);
    console.log(`  Add-on Group: ${group.name} -> ${docRef.id}`);
  }

  // 4. Seed default settings
  const stationRouting: Record<string, 'prep' | 'kitchen'> = {};
  for (let i = 0; i < categories.length; i++) {
    stationRouting[categoryIds[i]] = categories[i].defaultStation;
  }

  await setDoc(doc(db, 'settings', 'global'), {
    currentOrderNumber: 0,
    cafeInfo: {
      name: 'Joe Street Cafe & Study Lounge',
      address: 'Sitio Malinong East, Brgy. Layog, Maasin, Iloilo 5030',
      phone: '',
    },
    stationRouting,
    storeStatus: {
      isOpen: false,
      openedAt: null,
      openingCash: 0,
      closedAt: null,
    },
    location: {
      lat: 10.9425778,
      lng: 122.4177239,
      radiusMeters: 100,
    },
    adminPin: '1234',
  });
  console.log('  Settings: global -> created');

  console.log('\nSeed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
