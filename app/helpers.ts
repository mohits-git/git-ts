import fs from "fs";
import zlib from "zlib";

export const getShaContent = (sha: string) => {
  const filePath = `.git/objects/${sha.substring(0, 2)}/${sha.substring(2)}`;
  const data = fs.readFileSync(filePath);
  return zlib.unzipSync(data);
}
