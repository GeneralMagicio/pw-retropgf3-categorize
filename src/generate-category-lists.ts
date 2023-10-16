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
  `Below is a list of web3 / blockchain projects categories.
  
  I would like to summarize and create a new list of categories based on this list. 
  
  Boil down the wisdom from the first list into this new list that should contain max 20 categories. 
  
  IMPORTANT: Each category should contain max 3 words.

  Output one category per line, no row numbers, no commas or other separators.  
  
  Category list: {allCategories}`
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
