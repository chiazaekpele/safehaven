// Image slots. Drop the real file at `src` (under /public) and set `available: true`.
// Until then the page renders a clearly labelled empty slot instead of a broken image.

export type ImageSlot = {
  src: string;
  alt: string;
  width: number;
  height: number;
  available: boolean;
};

export const IMAGES = {
  heroFood: {
    src: "/images/hero-food.jpg",
    alt: "Trays of rice with chicken prepared for students by Safe Haven",
    width: 960,
    height: 1280,
    available: true,
  },
  mealPacks: {
    src: "/images/meal-packs.jpg",
    alt: "Packed meals of rice and chicken ready to be shared with students",
    width: 960,
    height: 1280,
    available: true,
  },
  flyer: {
    src: "/flyer/flyer.jpg",
    alt: "Safe Haven Foundation presents Food Donation, 3rd Edition. Help provide a meal. We can't fix everything that's wrong with the world but with ₦1,200 we can provide a meal to one person. You can also donate provisions.",
    width: 1672,
    height: 941,
    available: true,
  },
} satisfies Record<string, ImageSlot>;
