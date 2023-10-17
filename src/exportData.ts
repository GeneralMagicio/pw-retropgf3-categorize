import { ApplicationFullLoader } from "./langchain/ApplicationFullLoader";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { Parser } from "@json2csv/plainjs";
import { dataDirName } from "./config";
import fs from "fs/promises";
import pc from "picocolors";

type FlaggedApplication = {
  project: string;
  applicantType: string;
  payoutAddress: string;
  reason: string;
};

export async function exportData() {
  console.log(`${pc.gray("│\n")}◆  Exporting data`);

  await fs.mkdir("export").catch((err) => {});

  let loader = new DirectoryLoader(dataDirName, {
    ".json": (path) => new ApplicationFullLoader(path),
  });
  let docs = await loader.load();

  let flaggedApplications: FlaggedApplication[] = [];
  for (const doc of docs) {
    const application = JSON.parse(doc.pageContent);
    if (application.pwIsFlagged) {
      flaggedApplications.push({
        project: application.Project,
        applicantType: application.applicantType,
        payoutAddress: application.payoutAddress,
        reason: application.pwFlaggedReason,
      });
    }
  }

  try {
    const parser = new Parser();
    const csv = parser.parse(flaggedApplications);
    await fs.writeFile("export/flagged-applications.csv", csv);
  } catch (err) {
    console.log(
      `◆  Error exporting: ${err instanceof Error ? err.message : err}`
    );
  }

  console.log(`${pc.green("☑")} Exported flagged applications`);
}
