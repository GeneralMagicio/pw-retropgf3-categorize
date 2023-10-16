import * as fs from "fs";

import {
  dataDirName,
  indivdualEmbeddingsFilePath,
  projectEmbeddingsFilePath,
} from "../src";

import { ApplicationCategoryLoader } from "../src/langchain/ApplicationCategoryLoader";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { spinner } from "@clack/prompts";

const openAIEmbeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export async function createEmbeddings(): Promise<void> {
  const s = spinner();

  // PROJECTS

  s.start("Creating PROJECT embeddings");

  let loader = new DirectoryLoader(dataDirName, {
    ".json": (path) => new ApplicationCategoryLoader(path, "PROJECT"),
  });
  let docs = await loader.load();

  let embeddings = await openAIEmbeddings.embedDocuments(
    docs.map((doc) => doc.pageContent)
  );

  let embeddingsStr = JSON.stringify(embeddings);
  fs.writeFileSync(projectEmbeddingsFilePath, embeddingsStr);

  s.stop(`Created ${embeddings.length} PROJECT embeddings.`);

  // INDIVIDUAL

  s.start("Creating INDIVIDUAL embeddings");

  loader = new DirectoryLoader(dataDirName, {
    ".json": (path) => new ApplicationCategoryLoader(path, "INDIVIDUAL"),
  });
  docs = await loader.load();

  embeddings = await openAIEmbeddings.embedDocuments(
    docs.map((doc) => doc.pageContent)
  );

  embeddingsStr = JSON.stringify(embeddings);
  fs.writeFileSync(indivdualEmbeddingsFilePath, embeddingsStr);

  s.stop(`Created ${embeddings.length} INDIVIDUAL embeddings.`);
}
