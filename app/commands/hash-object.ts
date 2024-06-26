import crypto from "crypto";
import fs from "fs";
import zlib from "zlib";

export const hashObject = (filePath: string): string | undefined => {
  const fileContent = fs.readFileSync(filePath);
  const blobContent = Buffer.concat([
    Buffer.from(`blob ${fileContent.length}\0`),
    fileContent
  ]);
  const compressedContent = zlib.deflateSync(blobContent);
  const hash = crypto.createHash('sha1').update(compressedContent).digest('hex');
  const dirName = hash.substring(0, 2);
  const blobObjectFile = hash.substring(2);
  try {
    fs.mkdirSync(`./.git/objects/${dirName}`, { recursive: true });
  } catch(error) {
    // Directory already exists, no action needed
  }
  fs.writeFileSync(`./.git/objects/${dirName}/${blobObjectFile}`, compressedContent);
  return hash;
}
