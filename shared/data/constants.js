// ─────────────────────────────────────────────────────────────────
// Potential — Shared Static Constants
// Extracted from prototype; used by src/screens/PotentialApp.jsx
// and will be consumed by shared/engine/ in Phase 3 (MATCH-01).
// Plain .js — shared/data is backend-owned, no TS annotations yet.
// ─────────────────────────────────────────────────────────────────

export const PROFESSION_CATEGORIES = {
  "Design & Creative": ["Graphic Designer","UX/UI Designer","Interior Designer","Photographer","Video Editor","Animator","Art Director","Fashion Designer"],
  "Tech & Engineering": ["Software Engineer","Data Analyst","Data Scientist","DevOps Engineer","Mechanical Engineer","Civil Engineer","Electrical Engineer","IT Support"],
  "Business & Finance": ["Accountant","Financial Analyst","Marketing Manager","Project Manager","HR Manager","Business Analyst","Real Estate Agent","Insurance Agent"],
  "Healthcare": ["Registered Nurse","Dental Hygienist","Physical Therapist","Pharmacy Technician","Medical Assistant","Paramedic","Psychologist"],
  "Education & Social": ["Teacher (K-12)","College Professor","Social Worker","School Counselor","Librarian","Tutor / Instructor"],
  "Trades & Services": ["Electrician","Plumber","HVAC Technician","Welder","Auto Mechanic","Chef / Cook","Restaurant Manager","Barber / Cosmetologist"],
  "Media & Writing": ["Writer / Content Creator","Journalist","PR Specialist","Social Media Manager","Copywriter","Technical Writer"],
};

export const BASE_SALARIES = {
  "Graphic Designer":55000,"UX/UI Designer":82000,"Interior Designer":56000,"Photographer":42000,"Video Editor":52000,"Animator":65000,"Art Director":95000,"Fashion Designer":58000,
  "Software Engineer":110000,"Data Analyst":72000,"Data Scientist":105000,"DevOps Engineer":115000,"Mechanical Engineer":80000,"Civil Engineer":75000,"Electrical Engineer":82000,"IT Support":52000,
  "Accountant":65000,"Financial Analyst":78000,"Marketing Manager":80000,"Project Manager":85000,"HR Manager":78000,"Business Analyst":75000,"Real Estate Agent":62000,"Insurance Agent":55000,
  "Registered Nurse":72000,"Dental Hygienist":78000,"Physical Therapist":82000,"Pharmacy Technician":38000,"Medical Assistant":36000,"Paramedic":45000,"Psychologist":85000,
  "Teacher (K-12)":52000,"College Professor":78000,"Social Worker":48000,"School Counselor":55000,"Librarian":52000,"Tutor / Instructor":40000,
  "Electrician":58000,"Plumber":56000,"HVAC Technician":52000,"Welder":48000,"Auto Mechanic":46000,"Chef / Cook":38000,"Restaurant Manager":52000,"Barber / Cosmetologist":35000,
  "Writer / Content Creator":50000,"Journalist":48000,"PR Specialist":60000,"Social Media Manager":55000,"Copywriter":58000,"Technical Writer":72000,
};

export const LIFESTYLE_TAGS = [
  { id:"nightlife", label:"Nightlife & Bars", icon:"🍸" },
  { id:"outdoors", label:"Hiking & Nature", icon:"🥾" },
  { id:"arts", label:"Arts & Museums", icon:"🎨" },
  { id:"foodie", label:"Food Scene", icon:"🍜" },
  { id:"fitness", label:"Gyms & Fitness", icon:"💪" },
  { id:"family", label:"Family-Friendly", icon:"👨‍👩‍👧" },
  { id:"walkable", label:"Walkable / Transit", icon:"🚶" },
  { id:"diversity", label:"Cultural Diversity", icon:"🌍" },
  { id:"music", label:"Live Music", icon:"🎶" },
  { id:"beach", label:"Beach / Water", icon:"🏄" },
  { id:"snow", label:"Snow Sports", icon:"🏂" },
  { id:"startup", label:"Startup Scene", icon:"🚀" },
  { id:"lgbtq", label:"LGBTQ+ Friendly", icon:"🏳️‍🌈" },
  { id:"quiet", label:"Peace & Quiet", icon:"🌿" },
];

export const DEAL_BREAKERS = [
  "No extreme cold", "No extreme heat", "Must have public transit",
  "Must be walkable", "No state income tax", "Must be near mountains",
  "Must be near ocean/coast", "Low crime only", "Need international airport",
  "Must have strong job market in my field"
];
