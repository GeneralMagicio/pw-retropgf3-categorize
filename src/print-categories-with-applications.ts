import { dataDirName, projectCategoryListFilePath } from "./config";

import { ApplicationFullLoader } from "./langchain/ApplicationFullLoader";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import fs from "fs/promises";
import pc from "picocolors";

export async function printCategoriesWithApplications(filter: string) {
  let categoryList = await fs.readFile(projectCategoryListFilePath, "utf8");
  const categories = categoryList.split("\n");

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

      if (application.pwCategory === category && !application.pwIsNoise) {
        console.log(`◆  - ${application.Project}`);
        counter++;
      }
    }
  }

  // Noise applications
  console.log(`${pc.gray("│\n")}◆  Noise applications:`);

  for (let i = 0; i < applications.length; i++) {
    const doc = applications[i];
    const application = JSON.parse(doc.pageContent);

    if (application.pwIsNoise) {
      console.log(`◆  - ${application.Project}`);
      counter++;
    }
  }

  // Applications without categories
  console.log(`${pc.gray("│\n")}◆  Applications without categories:`);

  for (let i = 0; i < applications.length; i++) {
    const doc = applications[i];
    const application = JSON.parse(doc.pageContent);

    if (!application.pwCategory && !application.pwIsNoise) {
      console.log(`◆  - ${application.Project}`);
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
}
