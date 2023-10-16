import { ApplicationFullLoader } from "./langchain/ApplicationFullLoader";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PromptTemplate } from "langchain/prompts";
import { YesOrNo } from ".";
import { dataDirName } from "./config";
import fs from "fs/promises";
import pc from "picocolors";

const model = new ChatOpenAI({ modelName: "gpt-4" });

const promptTemplate = PromptTemplate.fromTemplate(
  `Is the application correctly categorized?

  Below is an application of a project or individual active in the Web3/blockchain space. 
  
  The application is for a grants program rewarding projects/individuals that have created 
  measurable impact in the Web3/blockchain space.

  We anticipate some applications to be miscategorized. A PROJECT application might be 
  categorized as an INDIVIDUAL and vice versa. Your job is to determine if the 
  application you are reading is correctly categorized in the "applicantType" field. 

  Note: 
  - The "applicantType" field is either "PROJECT" or "INDIVIDUAL".
  - Applicants might use project sounding names even if they are individuals. 
  - Applicants often use avatar names instead of legal names.
  - A sure sign of an individual is if application talks about "I" or "me"

  If you think the application correctly categorized, output YES. Otherwise output a one
  sentence reason why it is not correctly categorized.

  Application: {project}`
);

const chain = promptTemplate.pipe(model);

export async function identifyWronglyMarkedApplications(analyzeAll: YesOrNo) {
  console.log(`${pc.gray("│\n")}◆  Identifying wrongly marked applications`);

  let loader = new DirectoryLoader(dataDirName, {
    ".json": (path) => new ApplicationFullLoader(path),
  });
  let applications = await loader.load();

  for (let i = 0; i < applications.length; i++) {
    process.stdout.write(`◆  Processing ${i + 1} / ${applications.length}\r`);

    try {
      const doc = applications[i];
      const application = JSON.parse(doc.pageContent);

      const shouldProcess =
        analyzeAll === "yes" || !application.pwApplicantTypeChecked;

      if (!shouldProcess) {
        continue;
      }

      delete application.pwApplicantTypeChecked;

      const result = await chain.invoke({
        project: JSON.stringify(application),
      });

      if (result.content !== "YES") {
        console.log(
          `\n${pc.gray("│\n")}◆  Application: ${application.Project}`
        );
        console.log(`◆  Reason: ${result.content}${pc.gray("\n│")}`);

        application.applicantType =
          application.applicantType === "PROJECT" ? "INDIVIDUAL" : "PROJECT";
        application["Applicant Type"] = application.applicantType;
        application.recategorizeReason = result.content;
      }
      application.pwApplicantTypeChecked = true;

      // Save merged data back to file
      await fs.writeFile(
        doc.metadata.source,
        JSON.stringify(application, null, 2)
      );
    } catch (err) {
      console.log(
        `◆  Error processing ${applications[i].metadata.source}: ${
          err instanceof Error ? err.message : err
        }`
      );
    }
  }

  console.log("◆  Done identifying wrongly marked applications.");
}
