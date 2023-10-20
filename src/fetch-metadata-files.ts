import { applicationsFilePath, dataDirName } from "./config";

import { YesOrNo } from ".";
import csv from "csvtojson";
import fetch from "node-fetch";
import { fetchAllApplications } from "./gql/fetchAllApplications";
import { fetchUserProfiles } from "./gql/fetchUserProfiles";
import fs from "fs/promises";
import { get } from "http";
import path from "path";
import pc from "picocolors";

const getValue = (application: any, name: string) =>
  application.find((field: any) => field.name === name)?.value.value;

export async function fetchMetadataFiles(overwrite: YesOrNo) {
  console.log(`${pc.gray("│\n")}◆  Fetching files`);

  const applicationAttestations = (await fetchAllApplications())
    .attestations as any[];

  for (let i = 0; i < applicationAttestations.length; i++) {
    process.stdout.write(
      `◆  Fetching ${i + 1} / ${applicationAttestations.length}\r`
    );

    const attestation = applicationAttestations[i];

    const data = JSON.parse(applicationAttestations[i].decodedDataJson);
    const url = getValue(data, "applicationMetadataPtr");

    const filename = path.basename(url);
    const filepath = path.join(dataDirName, filename);

    let shouldFetch = overwrite === "yes";
    if (overwrite === "no") {
      try {
        await fs.access(filepath);
        // File exists, no need to fetch
      } catch {
        // File doesn't exist, need to fetch
        shouldFetch = true;
      }
    }

    if (shouldFetch) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.log(
            `\n${pc.gray("│\n")}◆  Failed to fetch ${url}: ${
              response.statusText
            }`
          );
          continue;
        }

        let fileData = await response.json();

        fileData.displayName = getValue(data, "displayName");

        const profileAttestations = (
          await fetchUserProfiles(attestation.attester)
        ).attestations as any[];

        if (profileAttestations.length > 0) {
          const profileData = JSON.parse(
            profileAttestations[0].decodedDataJson
          );
          const profileMetadataPtr = getValue(
            profileData,
            "profileMetadataPtr"
          );
          const profileMetadata = await (
            await fetch(profileMetadataPtr)
          ).json();
          fileData = {
            ...fileData,
            applicantName: getValue(profileData, "name"),
            ...profileMetadata,
          };
        }

        // Merge project data into file data
        fileData = {
          ...fileData,
          applicationMetadataPtr: url,
          RPGF3_Application_UID: attestation.id,
          applicantAddress: attestation.attester,
        };

        // Save merged data back to file
        await fs.writeFile(filepath, JSON.stringify(fileData, null, 2));
      } catch (err) {
        console.log(
          `\n${pc.gray("│\n")}◆  Error processing ${url}: ${
            err instanceof Error ? err.message : err
          }`
        );
      }
    }
  }

  console.log("◆  Done fetching files.");
}
