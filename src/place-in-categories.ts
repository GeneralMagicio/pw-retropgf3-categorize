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
  `Given a detailed description of a project in the Web3/blockchain domain, thoroughly 
  analyze the nuances and essence of the project. Your task is to assign the most appropriate 
  category from the provided list, ensuring that the core purpose and nature of the project are accurately captured.
  
  Choose only ONE category from the following list:
  {categoryList}
  
  Output the chosen category without any additional punctuation or formatting.
  
  Project Description:
  {project}`
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
