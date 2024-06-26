import crypto from "crypto";
import fs from "fs";
import zlib from "zlib";

export const hashObject = (filePath: string): string | undefined => {
  const fileContent = fs.readFileSync(filePath);
  const blobContent = `blob ${fileContent.toString('utf8').length}\0${fileContent.toString('utf8')}`
  const compressedContent = zlib.deflateSync(blobContent);
  const hash = crypto.createHash('sha1', compressedContent).digest('hex');
  const dirName = hash.substring(0, 2);
  const blobObjectFile = hash.substring(2);
  fs.mkdirSync(`./.git/objects/${dirName}`, { recursive: true });
  fs.writeFileSync(`./.git/objects/${dirName}/${blobObjectFile}`, compressedContent);
  console.log(hash);
  return hash;
}
