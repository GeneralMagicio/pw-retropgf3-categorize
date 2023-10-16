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
  `Is the application noise?

  Below is a application of a project or individual active in the Web3/blockchain space. 
  
  The application is for a grants program rewarding projects/individuals that have created 
  measurable impact in the Web3/blockchain space.

  We anticipate some applications to be fake/spam/noise. Your job is to determine if the 
  application you are reading is from a real project/individual or if it should be 
  considered noise or spam. 

  If you think the application is noise, output a one sentence reason why. Otherwise output NO.

  Application: {project}`
);

const chain = promptTemplate.pipe(model);

export async function identifyNoiseApplications(analyzeAll: YesOrNo) {
  console.log(`${pc.gray("│\n")}◆  Identifying noise applications`);

  let loader = new DirectoryLoader(dataDirName, {
    ".json": (path) => new ApplicationFullLoader(path),
  });
  let applications = await loader.load();

  for (let i = 0; i < applications.length; i++) {
    process.stdout.write(`◆  Processing ${i + 1} / ${applications.length}\r`);

    try {
      const doc = applications[i];
      const application = JSON.parse(doc.pageContent);

      const shouldProcess = analyzeAll === "yes" || !application.pwIsNoise;

      if (!shouldProcess) {
        continue;
      }

      delete application.pwIsNoise;
      delete application.pwNoiseReason;

      const result = await chain.invoke({
        project: JSON.stringify(application),
      });

      application.pwIsNoise = false;
      if (result.content !== "NO") {
        console.log(
          `\n${pc.gray("│\n")}◆  Application: ${application.Project}`
        );
        console.log(`◆  Reason: ${result.content}${pc.gray("\n│")}`);

        application.pwIsNoise = true;
        application.pwNoiseReason = result.content;
      }

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

  console.log("◆  Done identifying noise applications.");
}
