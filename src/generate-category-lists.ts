import {
  dataDirName,
  individualCategoryListFilePath,
  projectCategoryListFilePath,
} from "./config";

import { ApplicationCategoryLoader } from "./langchain/ApplicationCategoryLoader";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PromptTemplate } from "langchain/prompts";
import fs from "fs";
import pc from "picocolors";

const model = new ChatOpenAI({ modelName: "gpt-4" });

const categoryTemplate = PromptTemplate.fromTemplate(
  `Given a comprehensive list of web3/blockchain project categories provided below, 
  generate a concise list that encapsulates the essence of the original list. 
  
  The summarized list should:
  - Have a maximum of 20 categories.
  - Each category name should be no more than 3 words.
  - Present the categories line by line without any numbering, commas, or other separators.
  
  Original Category List:
  {allCategories}`
);

const categoryChain = categoryTemplate.pipe(model);

export async function generateCategoryLists() {
  // PROJECTS

  console.log(`${pc.gray("│\n")}◆  Creating PROJECT categories`);

  let loader = new DirectoryLoader(dataDirName, {
    ".json": (path) => new ApplicationCategoryLoader(path, "PROJECT"),
  });
  let applications = await loader.load();

  let allCategories = applications.map((doc) => doc.pageContent).join("\n");

  let categoryResult = await categoryChain.invoke({
    allCategories,
  });

  fs.writeFileSync(projectCategoryListFilePath, categoryResult.content);

  console.log("◆  Created PROJECT categories");

  // INDIVIDUAL

  console.log(`${pc.gray("│\n")}◆  Creating INDIVIDUAL categories`);

  loader = new DirectoryLoader(dataDirName, {
    ".json": (path) => new ApplicationCategoryLoader(path, "INDIVIDUAL"),
  });
  applications = await loader.load();

  allCategories = applications.map((doc) => doc.pageContent).join("\n");

  categoryResult = await categoryChain.invoke({
    allCategories,
  });

  fs.writeFileSync(individualCategoryListFilePath, categoryResult.content);

  console.log("◆  Created INDIVIDUAL categories");
}
