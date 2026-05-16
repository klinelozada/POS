/**
 * Maps menu item names (lowercased) to their image paths in /images/menu/.
 * Items without a specific photo fall back to a category image.
 */
const imageMap: Record<string, string> = {
  // Coffee - Hot
  'brewed coffee': '/images/menu/brewed-coffee.png',
  'americano': '/images/menu/americano.png',
  'cafe latte': '/images/menu/cafe-latte.png',
  'salted caramel': '/images/menu/salted-caramel.png',
  // Coffee - Iced
  'iced americano': '/images/menu/iced-americano.png',
  'greek frappe': '/images/menu/greek-frappe.png',
  'iced latte': '/images/menu/iced-latte.png',
  'dalgona': '/images/menu/iced-dalgona.png',
  'caramel macchiato': '/images/menu/iced-caramel-macchiato.png',
  // Chocolate - Hot
  'hot chocolate': '/images/menu/hot-chocolate.png',
  'hot mocha': '/images/menu/hot-mocha.png',
  // Chocolate - Iced
  'iced choco': '/images/menu/iced-chocolate.png',
  'iced choco latte': '/images/menu/iced-chocolate-latte.png',
  'iced choco oreo': '/images/menu/iced-chocolate-oreo.png',
  'iced choco strawberry': '/images/menu/iced-chocolate-strawberry.png',
  // Milk Tea - Classics
  'wintermelon': '/images/menu/wintermelon.png',
  'okinawa': '/images/menu/okinawa.png',
  'taro': '/images/menu/taro.png',
  'cookies & cream': '/images/menu/cookies-and-cream.png',
  'cookies & cream milk tea': '/images/menu/cookies-and-cream.png',
  // Milk Tea - Mango Series
  'mango milk tea': '/images/menu/mango.png',
  'iced choco mango': '/images/menu/iced-chocolate-mango.png',
  'mango strawberry': '/images/menu/mango-strawberry.png',
  'iced mango coffee': '/images/menu/iced-mango-coffee.png',
  'iced mango latte': '/images/menu/iced-mango-coffee.png',
  'mango coffee shake': '/images/menu/mango.png',
  'mango cloud classic': '/images/menu/mango.png',
  'mango berry cloud': '/images/menu/mango-berry-cloud.png',
  'mango citrus cloud': '/images/menu/mango-passion-fruit-cloud.png',
  'berry cloud': '/images/menu/mango-berry-cloud.png',
  'citrus cloud': '/images/menu/mango-passion-fruit-cloud.png',
  'classic': '/images/menu/mango.png',
  // Milk Tea - Matcha Series
  'matcha latte': '/images/menu/matcha.png',
  'matcha strawberry': '/images/menu/matcha-strawberry.png',
  'dirty matcha': '/images/menu/dirty-matcha.png',
  'matcha mango': '/images/menu/matcha-mango.png',
  // Street Fizz
  'strawberry sunset': '/images/menu/strawberry-sunset.png',
  'mango sunset': '/images/menu/mango-sunset.png',
  'berry sunset': '/images/menu/berry-sunset.png',
  'tropical sunset': '/images/menu/tropical-sunset.png',
  'sunset': '/images/menu/strawberry-sunset.png',
  'cucumber breeze': '/images/menu/cucumber-breeze.png',
  'lychee fizz': '/images/menu/lychee-fizz.png',
  'guava spritz': '/images/menu/guava-fizz.png',
  'calamansi spark': '/images/menu/calamansi-spark.png',
  'strawberry citrus fizz': '/images/menu/strawberry-citrus-fizz.png',
  'passion citrus punch': '/images/menu/passion-citrus-punch.png',
  'citrus boost': '/images/menu/calamansi-spark.png',
  'fresh & light': '/images/menu/cucumber-breeze.png',
  // Pasta
  'garlic tuna penne': '/images/menu/garlic-tuna.png',
  'chicken tomato penne': '/images/menu/chicken-tomato-penne.png',
  // Noodles
  'jjajangmyeon': '/images/menu/jajangmyeon-egg.png',
  'jjajangmyeon with egg': '/images/menu/jajangmyeon-egg.png',
  'kimchi ramen': '/images/menu/kimchi-ramen-egg.png',
  'kimchi ramen with egg': '/images/menu/kimchi-ramen-egg.png',
  'buldak cheese': '/images/menu/buldak-cheese-egg.png',
  'buldak cheese with egg': '/images/menu/buldak-cheese-egg.png',
  'pancit canton combo': '/images/menu/pancit-canton-combo.png',
  // Sandwiches
  'egg & toast': '/images/menu/egg-toast-sandwich.png',
  'egg sandwich': '/images/menu/egg-sandwich.png',
  'ham & egg sandwich': '/images/menu/ham-egg-sandwich.png',
  // Barkada Favorites
  'pinoy barkada platter': '/images/menu/pinoy-platter.png',
  'k-barkada platter': '/images/menu/k-barkada-platter.png',
  'cooler pitchers': '/images/menu/mango-cooler-pitcher.png',
  // Pitcher
  'mango cooler pitcher': '/images/menu/mango-cooler-pitcher.png',
  'cucumber cooler pitcher': '/images/menu/cucumber-cooler-pitcher.png',
  // Street Bites
  'spam fries': '/images/menu/street-bites.png',
  'french fries': '/images/menu/french-fries-solo.png',
  'french fries solo': '/images/menu/french-fries-solo.png',
  'french fries large': '/images/menu/french-fries-large.png',
  'street bites': '/images/menu/street-bites.png',
  'street bites platter': '/images/menu/street-bites.png',
};

/**
 * Maps category names (lowercased) to menu page images for fallback.
 */
const categoryImageMap: Record<string, string> = {
  // Parent categories → full menu page images
  'coffee': '/menu-image/coffee.jpg',
  'chocolates': '/menu-image/chocolate.jpg',
  'milk teas': '/menu-image/milktea.jpg',
  'street fizz': '/menu-image/street fizz.jpg',
  'mango cloud series': '/menu-image/milktea.jpg',
  'pastas': '/menu-image/pasta-sandwich.jpg',
  'sandwiches': '/menu-image/pasta-sandwich.jpg',
  'noodle corner': '/menu-image/noodle-corner.jpg',
  'barkada favorites': '/menu-image/barkada.jpg',
  'street bites': '/menu-image/street-bites.jpg',
  // Sub-categories (inherit parent image)
  'coffee - hot': '/menu-image/coffee.jpg',
  'coffee - iced': '/menu-image/coffee.jpg',
  'chocolates - hot': '/menu-image/chocolate.jpg',
  'chocolates - iced': '/menu-image/chocolate.jpg',
  'milk teas - classics': '/menu-image/milktea.jpg',
  'milk teas - mango series': '/menu-image/milktea.jpg',
  'milk teas - matcha series': '/menu-image/milktea.jpg',
  'pitcher': '/menu-image/barkada.jpg',
};

export function getMenuItemImage(name: string): string | undefined {
  return imageMap[name.toLowerCase()];
}

export function getCategoryImage(categoryName: string): string | undefined {
  return categoryImageMap[categoryName.toLowerCase()];
}
