import * as fs from "fs";
import * as path from "path";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const dataDirName = path.join(__dirname, "../data");

const approvalsFile = fs.readFileSync(
  path.join(__dirname, "../approved-applications.json"),
  "utf8"
);
const approvalsList = JSON.parse(approvalsFile).data.attestations;

console.log("\nAdd applicationApprovalUID to approved applications");
console.log("===================================================");

let processedFiles = 0;

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

      if (!parsedJson.pwIsFlagged) {
        const approval = approvalsList.find(
          (approval) => approval.recipient === parsedJson.applicantAddress
        );

        if (approval) {
          parsedJson.applicationApprovalUID = approval.id;
          fs.writeFileSync(filePath, JSON.stringify(parsedJson, null, 2));
          processedFiles++;
        } else {
          console.log(`NOT FOUND!! ${parsedJson.displayName}`);
        }
      }
    } catch (e) {
      console.error(`Failed to process ${file}: ${e.message}`);
    }
  }
});

console.log(`Processed ${processedFiles} files`);
