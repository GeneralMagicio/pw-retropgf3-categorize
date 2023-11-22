import * as fs from "fs";
import * as path from "path";

import { dirname } from "path";
import { fetchAttestation } from "./gql/fetchAttestation.js";
import { fetchUserProfiles } from "./gql/fetchUserProfiles.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const dataDirName = path.join(__dirname, "../data");

const approvalsFile = fs.readFileSync(
  path.join(__dirname, "../approved-applications.json"),
  "utf8"
);
const approvalsList = JSON.parse(approvalsFile);

console.log("\nSync local data with approved applcations list");
console.log("==============================================");

const getValue = (data, name) =>
  data.find((field) => field.name === name)?.value.value;

const isJsonEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

(async () => {
  const files = fs.readdirSync(dataDirName);

  // Get list of all files in the current directory
  for (const file of files) {
    const filePath = path.join(dataDirName, file);

    // Check if it's a file (and not a directory)
    if (fs.statSync(filePath).isFile()) {
      // Read file content
      const fileContent = fs.readFileSync(filePath, "utf8");

      try {
        // Parse JSON
        const localData = JSON.parse(fileContent);

        const approval = approvalsList.find(
          (approval) => approval.recipient === localData.applicantAddress
        );

        if (approval) {
          let updated = false;

          if (localData.applicationApprovalUID !== approval.id) {
            console.log(`Marking ${localData.displayName} as approved`);
            localData.applicationApprovalUID = approval.id;
            updated = true;
          }

          if (localData.pwIsFlagged) {
            console.log(`Marking ${localData.displayName} as not flagged`);
            localData.pwIsFlagged = false;
            delete localData.pwFlaggedReason;
            delete localData.pwCategory;
            updated = true;
          }

          // Fetch referenced attestation
          const approvedAttestation = await fetchAttestation(approval.refUID);

          const data = JSON.parse(
            approvedAttestation.attestations[0].decodedDataJson
          );

          const displayName = getValue(data, "displayName");
          if (localData.displayName !== displayName) {
            console.log(`Updating ${localData.displayName} to ${displayName}`);
            localData.displayName = displayName;
            updated = true;
          }

          // Fetch related metadata
          const applicationMetadataPtr = getValue(
            data,
            "applicationMetadataPtr"
          );

          const metadata = await fetch(applicationMetadataPtr);
          const metadataJson = await metadata.json();

          // applicantType
          if (localData.applicantType !== metadataJson.applicantType) {
            console.log(
              `Updating "${localData.displayName}". Applicant type: "${metadataJson.applicantType}"`
            );
            localData.applicantType = metadataJson.applicantType;
            updated = true;
          }

          // websiteUrl
          if (localData.websiteUrl !== metadataJson.websiteUrl) {
            console.log(
              `Updating "${localData.displayName}". Website URL: "${metadataJson.websiteUrl}"`
            );
            localData.websiteUrl = metadataJson.websiteUrl;
            updated = true;
          }

          // bio
          if (localData.bio !== metadataJson.bio) {
            console.log(
              `Updating "${localData.displayName}". Bio: "${metadataJson.bio}"`
            );
            localData.bio = metadataJson.bio;
            updated = true;
          }

          // contributionDescription
          if (
            localData.contributionDescription !==
            metadataJson.contributionDescription
          ) {
            console.log(
              `Updating "${localData.displayName}". Contribution description: "${metadataJson.contributionDescription}"`
            );
            localData.contributionDescription =
              metadataJson.contributionDescription;
            updated = true;
          }

          // contributionLinks
          if (
            !isJsonEqual(
              localData.contributionLinks,
              metadataJson.contributionLinks
            )
          ) {
            console.log(
              `Updating "${localData.displayName}". Contribution links.`
            );
            localData.contributionLinks = metadataJson.contributionLinks;
            updated = true;
          }

          // impactCategory
          if (
            !isJsonEqual(localData.impactCategory, metadataJson.impactCategory)
          ) {
            console.log(
              `Updating "${localData.displayName}". Impact category.`
            );
            localData.impactCategory = metadataJson.impactCategory;
            updated = true;
          }

          // impactDescription
          if (localData.impactDescription !== metadataJson.impactDescription) {
            console.log(
              `Updating "${localData.displayName}". Impact description: "${metadataJson.impactDescription}"`
            );
            localData.impactDescription = metadataJson.impactDescription;
            updated = true;
          }

          // impactMetrics
          if (
            !isJsonEqual(localData.impactMetrics, metadataJson.impactMetrics)
          ) {
            console.log(`Updating "${localData.displayName}". Impact metrics.`);
            localData.impactMetrics = metadataJson.impactMetrics;
            updated = true;
          }

          // fundingSources
          if (
            !isJsonEqual(localData.fundingSources, metadataJson.fundingSources)
          ) {
            console.log(
              `Updating "${localData.displayName}", Funding sources.`
            );
            localData.fundingSources = metadataJson.fundingSources;
            updated = true;
          }

          // Fetch user profile attestations
          const profileAttestations = await fetchUserProfiles(
            localData.applicantAddress
          );

          // Fetch user profile metadata from first attestation
          const profileData = JSON.parse(
            profileAttestations.attestations[0].decodedDataJson
          );

          // applicantName
          const applicantName = getValue(profileData, "name");

          if (localData.applicantName !== applicantName) {
            console.log(
              `Updating "${localData.displayName}". Applicant name: "${applicantName}"`
            );
            localData.applicantName = applicantName;
            updated = true;
          }

          const profileMetadataPtr = getValue(
            profileData,
            "profileMetadataPtr"
          );
          const profileMetadata = await fetch(profileMetadataPtr);
          const profileMetadataJson = await profileMetadata.json();

          // profileImageUrl
          if (
            localData.profileImageUrl !== profileMetadataJson.profileImageUrl
          ) {
            console.log(
              `Updating "${localData.displayName}". Profile image: "${profileMetadataJson.profileImageUrl}"`
            );
            localData.profileImageUrl = profileMetadataJson.profileImageUrl;
            updated = true;
          }

          // bannerImageUrl
          if (localData.bannerImageUrl !== profileMetadataJson.bannerImageUrl) {
            console.log(
              `Updating "${localData.displayName}". Banner image: "${profileMetadataJson.bannerImageUrl}"`
            );
            localData.bannerImageUrl = profileMetadataJson.bannerImageUrl;
            updated = true;
          }

          if (updated) {
            fs.writeFileSync(filePath, JSON.stringify(localData, null, 2));
          }
        } else {
          if (localData.applicationApprovalUID) {
            console.log(`🔴 Marking ${localData.displayName} as not approved`);
            delete parsedJson.applicationApprovalUID;
            delete parsedJson.pwCategory;
            parsedJson.pwIsFlagged = true;
            parsedJson.pwFlaggedReason = "Application not approved";
            fs.writeFileSync(filePath, JSON.stringify(parsedJson, null, 2));
          }
        }
      } catch (e) {
        console.error(`Failed to process ${file}: ${e.message}`);
      }
    }
  }
})();
