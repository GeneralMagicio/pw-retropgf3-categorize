import "dotenv/config";

import { intro, outro, select } from "@clack/prompts";

import { categorizeApplications } from "./categorize-applications";
import color from "picocolors";
import { exportFlaggedCsv } from "./exportFlaggedCsv";
import { exportFullAsJson } from "./exportFullAsJson";
import { exportTwitterCsv } from "./exportTwitterCsv";
import { exportWrongCategoryCsv } from "./exportWrongCategoryCsv";
import { fetchMetadataFiles } from "./fetch-metadata-files";
import { generateCategoryLists } from "./generate-category-lists";
import { identifyNoiseApplications } from "./identify-noise-applications";
import { identifyWronglyMarkedApplications } from "./identify-wrongly-marked-applications";
import { placeInCategories } from "./place-in-categories";
import { printCategoriesWithApplications } from "./print-categories-with-applications";

export type YesOrNo = symbol | "yes" | "no";

async function selectYesNo(message: string): Promise<YesOrNo> {
  return await select({
    message,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  });
}

(async () => {
  intro(`${color.bgCyan(color.black(" pw-categorize "))}`);

  while (true) {
    const choice = await select({
      message: "What now?",
      options: [
        { value: "fetch", label: "Fetch metadata files" },
        {
          value: "noise",
          label: "Identify rule breaking/false/noise/spam applications",
        },
        {
          value: "individual",
          label: "Identify wrongly marked INDIVIDUAL/PROJECT applications",
        },
        {
          value: "categorize",
          label: "Generate application category suggestions",
        },
        { value: "categories", label: "Generate master category lists" },
        { value: "arrange", label: "Arrange applications into category lists" },
        {
          value: "categoriesWithProjects",
          label: "Print categories with projects",
        },
        {
          value: "categoriesWithIndividuals",
          label: "Print categories with individuals",
        },
        {
          value: "exportFlaggedCsv",
          label: "Export flagged applications as CSV file",
        },
        {
          value: "exportWrongCategoryCsv",
          label: "Export wrong category applications as CSV file",
        },
        {
          value: "exportFullAsJson",
          label: "Export full dataset as JSON file",
        },
        {
          value: "exportTwitterCsv",
          label: "Export all Twitter contacts as CSV file",
        },
        { value: "exit", label: "Exit" },
      ],
    });

    let yesNo: YesOrNo = "yes";

    switch (choice) {
      case "fetch":
        yesNo = await selectYesNo("Overwrite already fetched files?");
        await fetchMetadataFiles(yesNo);
        break;
      case "noise":
        yesNo = await selectYesNo("Re-analyze already processed files?");
        await identifyNoiseApplications(yesNo);
        break;
      case "individual":
        yesNo = await selectYesNo("Re-analyze already processed files?");
        await identifyWronglyMarkedApplications(yesNo);
        break;
      case "categorize":
        yesNo = await selectYesNo("Re-analyze already processed files?");
        await categorizeApplications(yesNo);
        break;
      case "categories":
        await generateCategoryLists();
        break;
      case "arrange":
        yesNo = await selectYesNo("Re-analyze already processed files?");
        await placeInCategories(yesNo);
        break;
      case "categoriesWithProjects":
        await printCategoriesWithApplications("PROJECT");
        break;
      case "categoriesWithIndividuals":
        await printCategoriesWithApplications("INDIVIDUAL");
        break;
      case "exportFlaggedCsv":
        await exportFlaggedCsv();
        break;
      case "exportWrongCategoryCsv":
        await exportWrongCategoryCsv();
        break;
      case "exportFullAsJson":
        await exportFullAsJson();
        break;
      case "exportTwitterCsv":
        await exportTwitterCsv();
        break;
      case "exit":
        outro("Bye!");
        process.exit(0);
    }
  }
})();
