import * as fs from "fs";

import { BaseDocumentLoader } from "langchain/dist/document_loaders/base";
import { Document } from "langchain/document";
import { TextSplitter } from "langchain/dist/text_splitter";

export class ApplicationFullLoader implements BaseDocumentLoader {
  private path: string;
  private applicantType?: string;

  constructor(path: string, applicantType?: string) {
    this.path = path;
    this.applicantType = applicantType || undefined;
  }

  load(): Promise<Document<Record<string, any>>[]> {
    return new Promise((resolve, reject) => {
      // Only process JSON files
      if (!this.path.endsWith(".json")) {
        resolve([]);
      }
      fs.readFile(this.path, "utf8", (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        const doc = JSON.parse(data);

        if (this.applicantType && doc["applicantType"] !== this.applicantType) {
          resolve([]);
        }

        resolve([
          new Document({
            pageContent: data,
            metadata: {
              source: this.path,
            },
          }),
        ]);
      });
    });
  }
  loadAndSplit(
    splitter?: TextSplitter | undefined
  ): Promise<Document<Record<string, any>>[]> {
    throw new Error("Method not implemented.");
  }
}
