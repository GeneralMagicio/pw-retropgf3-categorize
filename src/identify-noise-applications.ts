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
  `Should this application be flagged? Does it violate the rules? If so, why?

  Below is a application of a project or individual active in the Web3/blockchain space. 
  
  The application is for a grants program rewarding projects/individuals that have created 
  measurable impact in the Web3/blockchain space.

  We anticipate some applications to be fake/spam/noise. Your job is to determine if the 
  application you are reading is from a real project/individual or if it should be 
  flagged as noise or spam. An application can also be flagged for violating the
  rules of the grants program.

  Grant program rules:
  1. Promises of future impact - promises of future deliverables or impact are not allowed. 
  2. False statements & deception - false claims about your contributions, past impact or funding & grants are not allowed. 
  3. Hateful Content - No racist, sexist, or otherwise hateful speech, no discrimination.
  4. Deceiving badgeholders - Malicious content that could cause harm or unintended consequences to users.
  5. Fraud & Impersonation - Claiming to be a brand or person you are not. The Grant owner must be directly affiliated with the project, the funds must go to the project.
  6. Advertising - Using RetroPGF application to showcase something you are selling like a token sale or NFT drop
  7. Bribery - Bribing badgeholders or vote buying is strictly forbidden.
  10. Outside of RetroPGF's scope - contributions that do not have a clear relationship to Optimism, applications that do not highlight a valid contribution* or contributions which are outside of the RetroPGF scope**.
      1. Contribution is defined as an activity which required a minimum time commitment of 1 hour and which provided impact to the Collective. 
      2. Please note that user interactions (e.g., sending transactions) on OP Mainnet, or on other OP chains that are part of the Superchain, are not in scope to be rewarded in RetroPGF 3.
  11. Spam - Applications containing spam, such as irrelevant answers, plagiarized content, broken or unrelated impact metrics and contribution links. Applications in languages other than English.

  If you think the application should be flagged, output a one sentence reason why. Otherwise output NO.

  Application: {project}`
);

const chain = promptTemplate.pipe(model);

export async function identifyNoiseApplications(analyzeAll: YesOrNo) {
  console.log(
    `${pc.gray("│\n")}◆  Identifying applications that should be flagged`
  );

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
        analyzeAll === "yes" || !("pwIsFlagged" in application);

      if (!shouldProcess) {
        continue;
      }

      delete application.pwIsFlagged;
      delete application.pwFlaggedReason;

      const result = await chain.invoke({
        project: JSON.stringify(application),
      });

      application.pwIsFlagged = false;
      if (result.content !== "NO") {
        console.log(
          `\n${pc.gray("│\n")}◆  Application: ${application.displayName}`
        );
        console.log(`◆  Reason: ${result.content}${pc.gray("\n│")}`);

        application.pwIsFlagged = true;
        application.pwFlaggedReason = result.content;
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

  console.log("◆  Done identifying flagged applications.");
}
