import { ApplicationFullLoader } from "./langchain/ApplicationFullLoader";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { Parser } from "@json2csv/plainjs";
import { dataDirName } from "./config";
import fs from "fs/promises";
import pc from "picocolors";

export async function exportFullAsJson() {
  console.log(`${pc.gray("│\n")}◆  Exporting full dataset as JSON`);

  await fs.mkdir("export").catch((err) => {});

  let loader = new DirectoryLoader(dataDirName, {
    ".json": (path) => new ApplicationFullLoader(path),
  });
  let docs = await loader.load();

  let applications = docs.map((doc) => JSON.parse(doc.pageContent));

  try {
    await fs.writeFile(
      "export/all-applications.json",
      JSON.stringify(applications, null, 2)
    );
  } catch (err) {
    console.log(
      `◆  Error exporting: ${err instanceof Error ? err.message : err}`
    );
  }

  console.log(`${pc.green("☑")} Exported finished`);
}
