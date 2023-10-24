import {
  dataDirName,
  individualCategoryListFilePath,
  projectCategoryListFilePath,
} from "./config";

import { ApplicationFullLoader } from "./langchain/ApplicationFullLoader";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { Parser } from "@json2csv/plainjs";
import fs from "fs/promises";

export async function exportCategorySuggestionsCsv(filter: string) {
  let categoryList =
    filter === "PROJECT"
      ? await fs.readFile(projectCategoryListFilePath, "utf8")
      : await fs.readFile(individualCategoryListFilePath, "utf8");
  let categories = categoryList.split("\n").map((line) => line.trim());

  let loader = new DirectoryLoader(dataDirName, {
    ".json": (path) => new ApplicationFullLoader(path, filter),
  });
  let docs = await loader.load();

  const applications: any[] = [];

  for (let doc of docs) {
    const application = JSON.parse(doc.pageContent);
    applications.push(application);
  }

  try {
    const parser = new Parser({
      fields: ["displayName",     });
    const csv = parser.parse(applications);
    await fs.writeFile(
      `export/category-suggestions-${filter.toLocaleLowerCase()}`,
      csv
    );
  } catch (err) {
    console.log(
      `◆  Error exporting: ${err instanceof Error ? err.message : err}`
    );
  }
}
