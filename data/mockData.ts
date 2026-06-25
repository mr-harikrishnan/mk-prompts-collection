import { Prompt } from "../types";

export const INITIAL_PROMPTS: Prompt[] = [
  {
    id: "prompt-1",
    title: "Romantic Rainy Walk in the City",
    category: "Love & Couples",
    shortDesc: "A romantic couple walking hand in hand under an umbrella in a cozy rainy night atmosphere.",
    longDesc: "This prompt generates a high-quality illustration of a loving couple strolling under a shared umbrella. It captures the warm glow of city lights reflecting on wet streets, creating an intimate, cozy, and cinematic atmosphere perfect for wallpapers or cards.",
    template: "A premium, minimalist digital vector art of a romantic couple, {boy_name} and {girl_name}, walking hand in hand under a single umbrella in the rain in {location}. The atmosphere is {atmosphere}, with soft city lights reflecting on the wet pavement. Cozy mood, slate and orange color palette, clean geometric lines, iOS application card design, highly detailed, no text.",
    image: "/images/love_couples.png",
    variables: [
      { name: "boy_name", label: "Boy's Name", defaultValue: "Lucas" },
      { name: "girl_name", label: "Girl's Name", defaultValue: "Emma" },
      { name: "location", label: "Location", defaultValue: "Paris" },
      { name: "atmosphere", label: "Atmosphere", defaultValue: "cozy twilight" }
    ],
    tags: ["Love", "Rain", "Minimalist", "Romantic", "Cozy"],
    copyCount: 1420,
    stars: 4.8,
    totalReviews: 24
  },
  {
    id: "prompt-2",
    title: "Long Distance Cross-Timezone Connection",
    category: "Long Distance",
    shortDesc: "A symbolic visual depicting two loved ones connecting across day and night timezones.",
    longDesc: "A premium split-screen art design showcasing two individuals video calling across different times of the day. One half features bright daylight with a sunny sky, while the other features a starry night. A golden, glowing line connects their devices, representing an unbroken link.",
    template: "A premium, minimalist digital illustration of two people, {person_a} in {left_city} and {person_b} in {right_city}, video calling across different timezones. The canvas is split: the left side has a bright, sunny daytime sky, and the right side has a dark, starry night sky. A thin, glowing line of warmth connects their devices. Premium macOS system card style, slate outline, coral accents, clean vector shape, no text.",
    image: "/images/long_distance.png",
    variables: [
      { name: "person_a", label: "Person A", defaultValue: "Aria" },
      { name: "left_city", label: "Left City (Day)", defaultValue: "Tokyo" },
      { name: "person_b", label: "Person B", defaultValue: "Leo" },
      { name: "right_city", label: "Right City (Night)", defaultValue: "New York" }
    ],
    tags: ["Long Distance", "Timezones", "Connection", "Split-Screen", "Warm"],
    copyCount: 980,
    stars: 4.9,
    totalReviews: 18
  },
  {
    id: "prompt-3",
    title: "Boho Minimalist Sun & Silhouette",
    category: "Aesthetic Art",
    shortDesc: "A warm, abstract design featuring a silhouette face surrounded by aesthetic boho elements.",
    longDesc: "A beautiful contemporary design with geometric layouts, featuring an abstract silhouette profile surrounded by organic line drawings, a terracotta sun, and minimal botanical shapes. Ideal for modern canvas prints or aesthetic posters.",
    template: "A premium, minimalist aesthetic digital art print featuring a {subject} silhouette outline. The background is a soft blend of {primary_tone}. Accented with a large terracotta sun, geometric circles, and a minimal {elements} drawing. Modern iOS application layout, clean vector outlines, warm organic textures, no text.",
    image: "/images/aesthetic_art.png",
    variables: [
      { name: "subject", label: "Subject Line Art", defaultValue: "abstract female face" },
      { name: "primary_tone", label: "Primary Color Tone", defaultValue: "warm terracotta and soft sand" },
      { name: "elements", label: "Accent Element", defaultValue: "crescent moon and botanical leaves" }
    ],
    tags: ["Aesthetic", "Boho", "Abstract", "Warm", "Minimalist"],
    copyCount: 2130,
    stars: 4.7,
    totalReviews: 31
  },
  {
    id: "prompt-4",
    title: "Futuristic Monolith Portal Gateway",
    category: "4K Posters",
    shortDesc: "A cinematic poster depicting an illuminated portal flanked by massive brutalist architecture.",
    longDesc: "This prompt generates a sci-fi landscape containing a large glowing gateway centered in a grand, brutalist structure. The composition highlights scale and depth, with misty rain and deep tech-blue lighting casting realistic reflections.",
    template: "A premium 4k sci-fi poster showcasing a futuristic brutalist architectural structure with a massive glowing circular portal in the center emitting {portal_color} light. The architecture consists of towering {architectural_style}. The environment is filled with {weather_effect}, causing volumetric light beams and realistic floor reflections. System UI styling, hyper-realistic details, cinematic grading, no text.",
    image: "/images/poster_4k.png",
    variables: [
      { name: "portal_color", label: "Portal Glow Color", defaultValue: "electric cyan and violet" },
      { name: "architectural_style", label: "Architecture Style", defaultValue: "monolithic slate towers" },
      { name: "weather_effect", label: "Weather Atmosphere", defaultValue: "misty fog and neon reflections" }
    ],
    tags: ["4K Poster", "Futuristic", "Sci-Fi", "Portal", "Brutalist"],
    copyCount: 1850,
    stars: 4.9,
    totalReviews: 29
  }
];

export const DEFAULT_SETTINGS = {
  pageName: "MK PROMPTS WORLD",
  instagramUsername: "mk_prompts_world",
  instagramLink: "https://www.instagram.com/mk_prompts_world",
  followersText: "120K followers",
  accessKey: "mkloveart"
};

export const DEFAULT_FEEDBACKS = [
  {
    id: "f-1",
    rating: 5,
    reviewer: "Sophia Bennett",
    date: "2026-06-23T14:30:00Z",
    comment: "These prompts are absolutely incredible! The rainy walk prompt generated the most beautiful art style I have ever seen. Seamless customizer experience!"
  },
  {
    id: "f-2",
    rating: 5,
    reviewer: "Liam Vance",
    date: "2026-06-24T09:15:00Z",
    comment: "Used the split-screen timezone template for an anniversary card and my partner loved it! Very clean iOS aesthetic, runs extremely fast."
  },
  {
    id: "f-3",
    rating: 4,
    reviewer: "Elena Rostova",
    date: "2026-06-25T11:45:00Z",
    comment: "Love the customizer feature. I'd love to see even more boho/aesthetic templates. Super premium feel!"
  }
];

export const DEFAULT_METRICS = {
  totalVisits: 3840,
  totalCopies: 6380,
  copiesHistory: [
    { date: "2026-06-19", promptTitle: "Romantic Rainy Walk in the City", category: "Love & Couples" },
    { date: "2026-06-20", promptTitle: "Boho Minimalist Sun & Silhouette", category: "Aesthetic Art" },
    { date: "2026-06-20", promptTitle: "Romantic Rainy Walk in the City", category: "Love & Couples" },
    { date: "2026-06-21", promptTitle: "Futuristic Monolith Portal Gateway", category: "4K Posters" },
    { date: "2026-06-22", promptTitle: "Long Distance Cross-Timezone Connection", category: "Long Distance" },
    { date: "2026-06-23", promptTitle: "Boho Minimalist Sun & Silhouette", category: "Aesthetic Art" },
    { date: "2026-06-24", promptTitle: "Romantic Rainy Walk in the City", category: "Love & Couples" },
    { date: "2026-06-24", promptTitle: "Futuristic Monolith Portal Gateway", category: "4K Posters" },
    { date: "2026-06-25", promptTitle: "Long Distance Cross-Timezone Connection", category: "Long Distance" }
  ],
  retentionCohort: [
    { week: "W1", percentage: 100 },
    { week: "W2", percentage: 88 },
    { week: "W3", percentage: 76 },
    { week: "W4", percentage: 69 },
    { week: "W5", percentage: 61 },
    { week: "W6", percentage: 58 }
  ]
};
