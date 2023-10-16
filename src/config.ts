import "dotenv/config";

import path, { dirname } from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const dataDirName = path.join(__dirname, "../data");

export const projectsFilePath = path.join(__dirname, "../projects.csv");

export const categoriesAndProjectsFilePath = path.join(
  __dirname,
  "../categories-and-projects.json"
);
export const categoriesAndIndividualsFilePath = path.join(
  __dirname,
  "../categories-and-individuals.json"
);

export const projectCategoryListFilePath = path.join(
  __dirname,
  "../projects-category-list.txt"
);
export const individualCategoryListFilePath = path.join(
  __dirname,
  "../individual-category-list.txt"
);
