import { ApplicationFullLoader } from "./langchain/ApplicationFullLoader";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { Parser } from "@json2csv/plainjs";
import { dataDirName } from "./config";
import fs from "fs/promises";
import pc from "picocolors";

type Application = {
  applicantType: string;
  websiteUrl: string;
  bio: string;
  contributionDescription: string;
  contributionLinks: string;
  impactCategory: string[];
  impactDescription: string;
  impactMetrics: string;
  fundingSources: string;
  payoutAddress: string;
  understoodKYCRequirements: boolean;
  understoodFundClaimPeriod: boolean;
  certifiedNotDesignatedOrSanctionedOrBlocked: boolean;
  certifiedNotSponsoredByPoliticalFigureOrGovernmentEntity: boolean;
  certifiedNotBarredFromParticipating: boolean;
  displayName: string;
  applicantName: string;
  profileImageUrl: string;
  bannerImageUrl: string;
  applicationMetadataPtr: string;
  RPGF3_Application_UID: string;
  applicantAddress: string;
  pwIsFlagged: boolean;
  pwFlaggedReason: string;
  pwApplicantTypeChecked: boolean;
  pwCategorySuggestions: string;
  pwCategory: string;
  pwRecategorizeToType: string;
  pwRecategorizeReason: string;
};
export async function exportFullAsCsv() {
  console.log(`${pc.gray("│\n")}◆  Exporting full csv`);

  await fs.mkdir("export").catch((err) => {});

  let loader = new DirectoryLoader(dataDirName, {
    ".json": (path) => new ApplicationFullLoader(path),
  });
  let docs = await loader.load();

  let applications: Application[] = [];
  for (const doc of docs) {
    const application = JSON.parse(doc.pageContent);
    applications.push(application);
  }

  try {
    const parser = new Parser();
    const csv = parser.parse(applications);
    await fs.writeFile("export/applications-full.csv", csv);
  } catch (err) {
    console.log(
      `◆  Error exporting: ${err instanceof Error ? err.message : err}`
    );
  }

  console.log(`${pc.green("☑")} Exported finished`);
}
