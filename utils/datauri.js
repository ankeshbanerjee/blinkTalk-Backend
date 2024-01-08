import DataURIParser from "datauri/parser.js";
import path from "path";

// https://www.npmjs.com/package/datauri#from-a-buffer

const dataUri = (file) => {
  const parser = new DataURIParser();
  const extension = path.extname(file.originalname);
  // converts the file buffer to a string that can be used to upload in cloudinary
  const fileStringBlobUri = parser.format(extension, file.buffer).content;
  return {
    fileStringBlobUri,
    extension,
  };
};

export { dataUri };
