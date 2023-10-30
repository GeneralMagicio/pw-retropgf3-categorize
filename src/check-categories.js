import * as fs from "fs";
import * as path from "path";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const dataDirName = path.join(__dirname, "../data");

const categoriesFile = fs.readFileSync(
  path.join(__dirname, "../projects-category-list.txt"),
  "utf8"
);
const categoriesList = categoriesFile.split("\n").map((line) => line.trim());

console.log("\nProject applications belonging to missing categories");
console.log("=====================================================");
// Get list of all files in the current directory
fs.readdirSync(dataDirName).forEach((file) => {
  const filePath = path.join(dataDirName, file);

  // Check if it's a file (and not a directory)
  if (fs.statSync(filePath).isFile()) {
    // Read file content
    const fileContent = fs.readFileSync(filePath, "utf8");

    try {
      // Parse JSON
      const parsedJson = JSON.parse(fileContent);

      if (
        parsedJson.pwIsFlagged === false &&
        parsedJson.applicantType === "PROJECT" &&
        !categoriesList.includes(parsedJson.pwCategory)
      ) {
        console.log(`${parsedJson.pwCategory} (${parsedJson.displayName})`);
      }
    } catch (e) {
      console.error(`Failed to process ${file}: ${e.message}`);
    }
  }
});

const individualsFile = fs.readFileSync(
  path.join(__dirname, "../individual-category-list.txt"),
  "utf8"
);
const individualsList = individualsFile.split("\n").map((line) => line.trim());

console.log("\n\nIndividual applications belonging to missing categories");
console.log("=====================================================");
// Get list of all files in the current directory
fs.readdirSync(dataDirName).forEach((file) => {
  const filePath = path.join(dataDirName, file);

  // Check if it's a file (and not a directory)
  if (fs.statSync(filePath).isFile()) {
    // Read file content
    const fileContent = fs.readFileSync(filePath, "utf8");

    try {
      // Parse JSON
      const parsedJson = JSON.parse(fileContent);

      if (
        parsedJson.pwIsFlagged === false &&
        parsedJson.applicantType === "INDIVIDUAL" &&
        !individualsList.includes(parsedJson.pwCategory)
      ) {
        console.log(`${parsedJson.pwCategory} (${parsedJson.displayName})`);
      }
    } catch (e) {
      console.error(`Failed to process ${file}: ${e.message}`);
    }
  }
});
