import * as kmeans from "node-kmeans";

import {
  dataDirName,
  projectEmbeddingsFilePath,
  projectsFilePath,
} from "../src";

import { ApplicationCategoryLoader } from "../src/langchain/ApplicationCategoryLoader";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PromptTemplate } from "langchain/prompts";
import csv from "csvtojson";
import { spinner } from "@clack/prompts";

const model = new ChatOpenAI({ modelName: "gpt-4" });

// const descriptionTemplate = PromptTemplate.fromTemplate(
//   `Below is a collection of project descriptions active in the Web3 space.

//   I would like you to summarize these descriptions in two sentences, max 300 characters. Summarize the descriptions as a whole, not each description individually.

//   What does these project do, what change do they hope to contribute to and where in the Web3 / blockchain ecosystem are they active?

//   Project descriptions: {summaries}`
// );

const categoryTemplate = PromptTemplate.fromTemplate(
  `Below is a collection of descriptions for projects active in the Web3 space.
  
  I would like you to name the main category, where in the ecosystem these projects are active.

  Examples of categories are: DeFi Lending protocols, NFT marketplaces, DAO platforms, Layer 2, Governance tools, etc.

  IMPORTANT: One category only, grouping these projects together. 

  IMPORTANT: Category must contain max 4 words.
  
  Project descriptions: {summaries}`
);

// const descriptionChain = descriptionTemplate.pipe(model);
const categoryChain = categoryTemplate.pipe(model);

export async function clusterize(
  embeddingsPath: string,
  k: number = 10
): Promise<kmeans.ClusteringOutput[] | undefined> {
  const embeddings = require(embeddingsPath);

  return new Promise((resolve, reject) => {
    kmeans.clusterize(embeddings, { k }, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

export async function createClusters() {
  const s = spinner();

  // s.start("Creating PROJECT clusters");

  const clusters = await clusterize(projectEmbeddingsFilePath, 10);

  if (clusters) {
    let loader = new DirectoryLoader(dataDirName, {
      ".json": (path) => new ApplicationCategoryLoader(path, "PROJECT"),
    });
    let projectDocs = await loader.load();

    console.log(`Number of clusters: ${clusters.length}`);

    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      console.log(`Cluster ${i + 1}: ${cluster.cluster.length} items`);

      let summaries = "";

      for (let j = 0; j < cluster.clusterInd.length; j++) {
        const projectIndex = cluster.clusterInd[j];
        const project = projectDocs[projectIndex];
        summaries += project.pageContent;
      }

      const categoryResult = await categoryChain.invoke({
        summaries,
      });

      console.log(`Cluster name: ${categoryResult.content}`);

      // const descriptionResult = await descriptionChain.invoke({
      //   summaries,
      // });

      // console.log(`Cluster description: ${descriptionResult.content}`);

      for (let j = 0; j < cluster.clusterInd.length; j++) {
        const projectIndex = cluster.clusterInd[j];
        const project = projectDocs[projectIndex];
        console.log(`  ${project.metadata.project}`);
      }
    }
  }

  console.log("\n");
  // s.stop("Done creating PROJECT clusters.");
}
