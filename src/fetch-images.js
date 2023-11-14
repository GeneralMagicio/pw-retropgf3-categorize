import * as fs from "fs";
import * as path from "path";

import axios from "axios";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDirName = path.join(__dirname, "../data");
const exportDirBase = path.join(__dirname, "../export/images");

const fetchAndSaveImage = async (url, savePath) => {
  try {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(savePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    console.error(`Error fetching image from ${url}: ${error.message}`);
  }
};

const processApplications = () => {
  fs.readdirSync(dataDirName).forEach(async (file) => {
    const filePath = path.join(dataDirName, file);

    if (fs.statSync(filePath).isFile()) {
      const fileContent = fs.readFileSync(filePath, "utf8");
      try {
        const application = JSON.parse(fileContent);
        if (!application.pwIsFlagged && application.profileImageUrl) {
          const imageUrl = application.profileImageUrl;
          const pwCategory = application.pwCategory.replace(
            /[^a-zA-Z0-9]/g,
            "_"
          ); // Sanitize folder name
          const imageDirPath = path.join(exportDirBase, pwCategory);

          if (!fs.existsSync(imageDirPath)) {
            fs.mkdirSync(imageDirPath, { recursive: true });
          }

          const imageNameEnding = imageUrl.split(".").pop();
          const imageName = path.basename(
            application.displayName
              .toLowerCase()
              .replace(/[^a-zA-Z0-9]/g, "_") +
              "." +
              imageNameEnding
          );
          const savePath = path.join(imageDirPath, imageName);

          await fetchAndSaveImage(imageUrl, savePath);
          // console.log("...");
          // console.log(
          //   `Saved image for ${application.displayName} to ${savePath}`
          // );
        }
      } catch (error) {
        console.error(`Failed to process ${file}: ${error.message}`);
      }
    }
  });
};

processApplications();
