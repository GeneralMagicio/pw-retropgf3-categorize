import {
  dataDirName,
  individualCategoryListFilePath,
  projectCategoryListFilePath,
} from "./config";

import { ApplicationFullLoader } from "./langchain/ApplicationFullLoader";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import fs from "fs/promises";
import pc from "picocolors";

export async function printCategoriesWithApplications(filter: string) {
  let categoryList =
    filter === "PROJECT"
      ? await fs.readFile(projectCategoryListFilePath, "utf8")
      : await fs.readFile(individualCategoryListFilePath, "utf8");
  let categories = categoryList.split("\n").map((line) => line.trim());

  let loader = new DirectoryLoader(dataDirName, {
    ".json": (path) => new ApplicationFullLoader(path, filter),
  });
  let applications = await loader.load();

  let counter = 0;

  // Applications with categories
  for (let category of categories) {
    console.log(`${pc.gray("│\n")}◆  Category: ${category}`);

    for (let i = 0; i < applications.length; i++) {
      const doc = applications[i];
      const application = JSON.parse(doc.pageContent);

      if (
        application.pwCategory === category &&
        application.pwIsFlagged === false
      ) {
        console.log(`◆  - ${application.Project}`);
        counter++;
      }
    }
  }

  // Noise applications
  console.log(`${pc.gray("│\n")}◆  Noise applications:`);

  let noiseCounter = 0;
  for (let i = 0; i < applications.length; i++) {
    const doc = applications[i];
    const application = JSON.parse(doc.pageContent);

    if (application.pwIsFlagged) {
      console.log(`◆  - ${application.Project}`);
      counter++;
      noiseCounter++;
    }
  }

  // Applications with no category match
  console.log(`${pc.gray("│\n")}◆  Applications with no category match:`);

  for (let i = 0; i < applications.length; i++) {
    const doc = applications[i];
    const application = JSON.parse(doc.pageContent);

    if (application.pwIsFlagged) {
      continue;
    }

    if (categories.indexOf(application.pwCategory) === -1) {
      console.log(`◆  - ${application.Project} (${application.pwCategory})`);
      counter++;
    }
  }

  // Check if all projects are accounted for

  if (counter !== applications.length) {
    console.log(
      `${pc.red(
        "│\n◆"
      )}  Error: Not all applications accounted for! ${counter} / ${
        applications.length
      }`
    );
  }

  // Applications without categories
  console.log(`${pc.gray("│\n")}◆  Applications without categories:`);

  let emptyCategories = 0;
  for (let i = 0; i < applications.length; i++) {
    const doc = applications[i];
    const application = JSON.parse(doc.pageContent);

    if (!application.pwCategory && !application.pwIsFlagged) {
      emptyCategories++;
      console.log(`◆  - ${application.Project}`);
    }
  }

  console.log(
    `${pc.gray("│\n")}◆  Total number of applications: ${applications.length}`
  );
  console.log(`◆  Number of noise applications: ${noiseCounter}`);
  console.log(
    `◆  Number of applications without categories: ${emptyCategories}`
  );
}
