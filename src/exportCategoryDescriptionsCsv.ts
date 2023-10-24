import { ApplicationFullLoader } from "./langchain/ApplicationFullLoader";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { Parser } from "@json2csv/plainjs";
import { dataDirName } from "./config";
import fs from "fs/promises";

export async function exportDescriptionsCsv(filter: string) {
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
      fields: [
        "displayName",
        "bio",
        "contributionDescription",
        "impactDescription",
        "RPGF3_Application_UID",
      ],
    });
    const csv = parser.parse(applications);
    await fs.writeFile(
      `export/${filter.toLocaleLowerCase()}-descriptions.csv`,
      csv
    );
  } catch (err) {
    console.log(
      `◆  Error exporting: ${err instanceof Error ? err.message : err}`
    );
  }
}
