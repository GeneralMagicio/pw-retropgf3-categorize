import { ApplicationFullLoader } from "./langchain/ApplicationFullLoader";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { Parser } from "@json2csv/plainjs";
import { dataDirName } from "./config";
import fs from "fs/promises";
import pc from "picocolors";

type WrongCategoryApplication = {
  project: string;
  applicantType: string;
  pwRecategorizeToType: string;
  reason: string;
  applicantAddress: string;
  RPGF3_Application_UID: string;
};

export async function exportWrongCategoryCsv() {
  console.log(
    `${pc.gray("│\n")}◆  Exporting wrong category applications as csv`
  );

  await fs.mkdir("export").catch((err) => {});

  let loader = new DirectoryLoader(dataDirName, {
    ".json": (path) => new ApplicationFullLoader(path),
  });
  let docs = await loader.load();

  let wrongCategoryApplications: WrongCategoryApplication[] = [];
  for (const doc of docs) {
    const application = JSON.parse(doc.pageContent);
    if (
      application.pwRecategorizeToType &&
      application.pwRecategorizeToType !== application.applicantType
    ) {
      wrongCategoryApplications.push({
        project: application.displayName,
        applicantType: application.applicantType,
        pwRecategorizeToType: application.pwRecategorizeToType,
        reason: application.pwRecategorizeReason,
        applicantAddress: application.applicantAddress,
        RPGF3_Application_UID: application.RPGF3_Application_UID,
      });
    }
  }

  try {
    const parser = new Parser();
    const csv = parser.parse(wrongCategoryApplications);
    await fs.writeFile("export/wrong-category-applications.csv", csv);
  } catch (err) {
    console.log(
      `◆  Error exporting: ${err instanceof Error ? err.message : err}`
    );
  }

  console.log(`${pc.green("☑")} Exported finished`);
}
