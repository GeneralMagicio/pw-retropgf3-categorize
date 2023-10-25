import * as fs from "fs";
import * as path from "path";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const dataDirName = path.join(__dirname, "../data");

// Get list of all files in the current directory
fs.readdirSync(".").forEach((file) => {
  const filePath = path.join(dataDirName, file);

  // Check if it's a file (and not a directory)
  if (fs.statSync(filePath).isFile()) {
    // Read file content
    const fileContent = fs.readFileSync(filePath, "utf8");

    try {
      // Parse JSON
      const parsedJson = JSON.parse(fileContent);

      // Compare fields and make changes if necessary
      if (
        typeof parsedJson.pwRecategorizeToType === "string" &&
        parsedJson.pwRecategorizeToType !== parsedJson.applicantType
      ) {
        parsedJson.applicantType = parsedJson.pwRecategorizeToType;
        delete parsedJson.pwCategory;
        // Save back to file
        fs.writeFileSync(filePath, JSON.stringify(parsedJson, null, 2), "utf8");
      }
    } catch (e) {
      console.error(`Failed to process ${file}: ${e.message}`);
    }
  }
});
