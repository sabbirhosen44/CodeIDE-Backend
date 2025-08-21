export const LANGUAGES = Object.freeze([
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C",
  "C++",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "Other",
] as const);

export const LANGUAGES_MAP: Record<string, string> = {
  cpp: "C++",
  js: "JavaScript",
  ts: "TypeScript",
};
