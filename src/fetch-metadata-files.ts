import { dataDirName, projectsFilePath } from "./config";

import { YesOrNo } from ".";
import csv from "csvtojson";
import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";
import pc from "picocolors";

export async function fetchMetadataFiles(overwrite: YesOrNo) {
  const projects = await csv().fromFile(projectsFilePath);

  console.log(`${pc.gray("│\n")}◆  Fetching files`);

  for (let i = 0; i < projects.length; i++) {
    process.stdout.write(`◆  Fetching ${i + 1} / ${projects.length}\r`);

    const project = projects[i];
    const url = project.Link;
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

        // Merge project data into file data
        fileData = { ...fileData, ...project };

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
