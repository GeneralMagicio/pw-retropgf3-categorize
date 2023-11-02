import * as fs from "fs";
import * as path from "path";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const dataDirName = path.join(__dirname, "../data");

const rejectedFile = fs.readFileSync(
  path.join(__dirname, "../rejected-applications.txt"),
  "utf8"
);
const rejectedList = rejectedFile.split("\n").map((line) => line.trim());

console.log("\nFiltering rejected applications");
console.log("===============================");
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

      if (rejectedList.includes(parsedJson.RPGF3_Application_UID)) {
        // Flagged in OP data as rejected
        parsedJson.pwIsFlagged = true;
        delete parsedJson.pwCategory;
        console.log(`Flagged ${parsedJson.displayName} as rejected`);
      } else {
        // Not flagged in OP data as rejected
        if ("pwIsFlagged" in parsedJson && parsedJson.pwIsFlagged === true) {
          // But flagged in our data as rejected
          // So unflag it
          parsedJson.pwIsFlagged = false;
          // And force the category to be re-evaluated for category
          delete parsedJson.pwCategory;
          console.log(
            `ℹ️ Unflagged ${parsedJson.displayName} as rejected, needs re-categorising`
          );
        }
      }

      fs.writeFileSync(filePath, JSON.stringify(parsedJson, null, 2));
    } catch (e) {
      console.error(`Failed to process ${file}: ${e.message}`);
    }
  }
});
