import { ApplicationFullLoader } from "./langchain/ApplicationFullLoader";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PromptTemplate } from "langchain/prompts";
import { YesOrNo } from ".";
import { dataDirName } from "./config";
import fs from "fs/promises";
import pc from "picocolors";

const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });

const promptTemplate = PromptTemplate.fromTemplate(
  `Below is a description of a project active in the Web3/blockchain space. 
  
  I would like you to categorize this project by suggesting a list of up to 3 categories that best 
  describe the project. 

  Example categories: Decentralized Finance (DeFi), Non-Fungible Tokens (NFTs), Layer 2 Scaling, 
  Smart Contract Platforms, Centralized Exchanges (CEXs), Decentralized Exchanges (DEXs), Stablecoins, 
  Cross-Chain Platforms, Privacy Coins, Supply Chain Management, Tokenization Platforms, Digital Identity, 
  Blockchain Gaming, Blockchain Infrastructure, Governance Tokens, Blockchain Education
  Content Creation, Community Building, User Experience & Adoption, Governance & Tokens, Developer Ecosystem,
  Smart Contract Platforms, Tokenization Platforms, Blockchain Infrastructure, Decentralized Finance (DeFi)
  End-User Experience, Wallet Management, NFT Aggregator, Trading Tools, Web3 Community Platform, Decentralized Identity
  Media Production, Cryptocurrency Services
  
  IMPORTANT: The example categories above are not exhaustive. You can suggest any category you think is relevant.
  IMPORTANT: One category is max 3 words!
  IMPORTANT: Be as detailed and specific as possible, e.g. "Decentralized Finance (DeFi)" instead of "Finance".
  IMPORTANT: Really think this through. What is the project about? What is the main focus? What is the main use case?

  Output a comma separated list of categories, no row numbers, no commas or other separators.

  Project description: {project}`
);

const chain = promptTemplate.pipe(model);

export async function categorizeApplications(analyzeAll: YesOrNo) {
  console.log(`${pc.gray("│\n")}◆  Categorising applications`);

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
        analyzeAll === "yes" || !("pwCategorySuggestions" in application);

      if (!shouldProcess) {
        continue;
      }

      const result = await chain.invoke({
        project: `${application.displayName}, ${application.bio},  ${application.contributionDescription}, ${application.impactDescription}`,
      });

      application.pwCategorySuggestions = result.content;

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
}
