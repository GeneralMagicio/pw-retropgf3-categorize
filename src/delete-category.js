import * as fs from "fs";
import * as path from "path";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const dataDirName = path.join(__dirname, "../data");

// Function to perform the operation
const processFile = (filePath, displayNamesArray) => {
  const fileContent = fs.readFileSync(filePath, "utf8");

  try {
    const parsedJson = JSON.parse(fileContent);

    // Check if displayName exists in displayNamesArray
    if (displayNamesArray.includes(parsedJson.displayName)) {
      delete parsedJson.pwCategory;
      fs.writeFileSync(filePath, JSON.stringify(parsedJson, null, 2), "utf8");
    }
  } catch (e) {
    console.error(`Failed to process ${filePath}: ${e.message}`);
  }
};

// Accept comma-separated displayNames as command line argument
const displayNames = process.argv[2] || "";
const displayNamesArray = displayNames.split(",");

// Loop through each file in the data directory
fs.readdirSync(dataDirName).forEach((file) => {
  const filePath = path.join(dataDirName, file);

  if (fs.statSync(filePath).isFile()) {
    processFile(filePath, displayNamesArray);
  }
});
