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
    alt: "Safe Haven Foundation 3rd Edition Food Drive flyer",
    width: 1080,
    height: 1350,
    available: false,
  },
} satisfies Record<string, ImageSlot>;
