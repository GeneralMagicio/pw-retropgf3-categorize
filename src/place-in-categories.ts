import {
  dataDirName,
  individualCategoryListFilePath,
  projectCategoryListFilePath,
} from "./config";

import { ApplicationFullLoader } from "./langchain/ApplicationFullLoader";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PromptTemplate } from "langchain/prompts";
import { YesOrNo } from ".";
import fs from "fs/promises";
import pc from "picocolors";

const model = new ChatOpenAI({ modelName: "gpt-4" });

const categoryTemplate = PromptTemplate.fromTemplate(
  `Below is a description of a project active in the Web3/blockchain space. 
  
  I would like you to categorize this project by choosing ONE of the categories in this list: 
  {categoryList}

  Output only this one category, no row numbers, no commas or other separators.

  Project description: {project}`
);

const categoryChain = categoryTemplate.pipe(model);

export async function placeInCategories(analyzeAll: YesOrNo) {
  // PROJECTS

  console.log(`${pc.gray("│\n")}◆  Arranging PROJECTS`);

  let categoryList = await fs.readFile(projectCategoryListFilePath, "utf8");

  let loader = new DirectoryLoader(dataDirName, {
    ".json": (path) => new ApplicationFullLoader(path, "PROJECT"),
  });
  let applications = await loader.load();

  for (let i = 0; i < applications.length; i++) {
    process.stdout.write(`◆  Arranging ${i + 1} / ${applications.length}\r`);

    const doc = applications[i];
    const application = JSON.parse(doc.pageContent);

    const shouldProcess = analyzeAll === "yes" || !application.pwCategory;

    if (!shouldProcess) {
      continue;
    }

    let categoryResult = await categoryChain.invoke({
      categoryList,
      project: `${application.Project}, ${application.bio},  ${application.contributionDescription}, ${application.impactDescription}, ${application.Tags}`,
    });

    application.pwCategory = categoryResult.content;

    // Save merged data back to file
    await fs.writeFile(
      doc.metadata.source,
      JSON.stringify(application, null, 2)
    );
  }

  console.log("Arranged projects");

  // INDIVIDUALS

  console.log(`${pc.gray("│\n")}◆  Arranging INDIVIDUALS`);

  categoryList = await fs.readFile(individualCategoryListFilePath, "utf8");

  loader = new DirectoryLoader(dataDirName, {
    ".json": (path) => new ApplicationFullLoader(path, "INDIVIDUAL"),
  });
  applications = await loader.load();

  for (let i = 0; i < applications.length; i++) {
    process.stdout.write(`◆  Arranging ${i + 1} / ${applications.length}\r`);

    const doc = applications[i];
    const application = JSON.parse(doc.pageContent);

    const shouldProcess = analyzeAll === "yes" || !application.pwCategory;

    if (!shouldProcess) {
      continue;
    }

    let categoryResult = await categoryChain.invoke({
      categoryList,
      project: `${application.Project}, ${application.bio},  ${application.contributionDescription}, ${application.impactDescription}, ${application.Tags}`,
    });

    application.pwCategory = categoryResult.content;

    // Save merged data back to file
    await fs.writeFile(
      doc.metadata.source,
      JSON.stringify(application, null, 2)
    );
  }

  console.log("Arranged individuals");
}
