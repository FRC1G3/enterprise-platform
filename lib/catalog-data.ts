const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

export const categories = [
  {
    name: "Men",
    description: "Modern foundations for every day",
    image: photo("photo-1617137968427-85924c800a22"),
  },
  {
    name: "Women",
    description: "Refined pieces, effortless style",
    image: photo("photo-1483985988355-763728e1935b"),
  },
  {
    name: "Shoes",
    description: "Built for wherever you go",
    image: photo("photo-1543163521-1bf539c55dd2"),
  },
  {
    name: "Accessories",
    description: "The details that complete a look",
    image: photo("photo-1612902456551-333ac5afa26e"),
  },
] as const;