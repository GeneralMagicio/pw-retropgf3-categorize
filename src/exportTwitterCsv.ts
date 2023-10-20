import { ApplicationFullLoader } from "./langchain/ApplicationFullLoader";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { Parser } from "@json2csv/plainjs";
import { dataDirName } from "./config";
import fs from "fs/promises";
import pc from "picocolors";

function extractTwitterUrls(text: string): string {
  // Regular expression to match Twitter URLs and URLs starting with 'https://x.com'
  const regex = /https:\/\/(twitter\.com|x\.com)[^\s,]+/g;

  // Extract all matching URLs
  const matches = text.match(regex);

  // Convert the array of URLs to a comma-separated string and return
  return matches ? matches.join(", ") : "";
}

function extractFirstTwitterUrl(text: string): string | null {
  // Regular expression to match Twitter URLs and URLs starting with 'https://x.com'
  const regex = /https:\/\/(twitter\.com|x\.com)[^\s,"?!]+/;

  // Find the first matching URL
  const match = text.match(regex);

  // Return the first match or null if not found
  return match ? match[0] : null;
}
export async function exportTwitterCsv() {
  console.log(`${pc.gray("│\n")}◆  Exporting all Twitter contacts as csv`);

  await fs.mkdir("export").catch((err) => {});

  let loader = new DirectoryLoader(dataDirName, {
    ".json": (path) => new ApplicationFullLoader(path),
  });
  let docs = await loader.load();

  let applications: any[] = [];
  for (const doc of docs) {
    const twitterUrl = extractFirstTwitterUrl(doc.pageContent);
    const application = JSON.parse(doc.pageContent);

    applications.push({
      project: application.displayName,
      twitterUrl: twitterUrl,
      applicantType: application.applicantType,
      pwIsFlagged: application.pwIsFlagged,
      payoutAddress: application.payoutAddress,
    });
  }

  try {
    const parser = new Parser();
    const csv = parser.parse(applications);
    await fs.writeFile("export/application-twitter-accounts.csv", csv);
  } catch (err) {
    console.log(
      `◆  Error exporting: ${err instanceof Error ? err.message : err}`
    );
  }

  console.log(`${pc.green("☑")} Exported finished`);
}
