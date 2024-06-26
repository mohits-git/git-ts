import fs from "fs";
import path from "path";
import zlib from "zlib";
import crypto from "crypto";
import { hashObject } from "./hash-object";
import { Modes } from "../types";

export const writeTree = (dirPath: string): string => {
  try {
    const dirContent = fs.readdirSync(dirPath);
    const treeEntries: Buffer[] = [];

    for (const file of dirContent) {
      if (file === ".git") continue;
      const pathToFile = path.join(dirPath, file);
      const stat = fs.statSync(pathToFile);

      let mode: string;
      let hash: string;

      if (stat.isFile()) {
        mode = Modes.RegularFile;
        hash = hashObject(pathToFile) || "";
      } else if (stat.isDirectory()) {
        mode = Modes.Directory;
        hash = writeTree(pathToFile);
      } else {
        continue; // Skip other types of files
      }

      if (!hash) throw new Error("Hashing failed for " + file);

      const entry = Buffer.concat([
        Buffer.from(`${mode} ${file}\0`),
        Buffer.from(hash, 'hex')
      ]);
      treeEntries.push(entry);
    }

    const treeContent = Buffer.concat([
      Buffer.from(`tree ${Buffer.concat(treeEntries).length}\0`),
      Buffer.concat(treeEntries)
    ]);

    const compressedData = zlib.deflateSync(treeContent);
    const hash = crypto.createHash('sha1').update(compressedData).digest('hex');
    
    const dirName = hash.substring(0, 2);
    const fileName = hash.substring(2);
    
    fs.mkdirSync(`./.git/objects/${dirName}`, { recursive: true });
    fs.writeFileSync(`./.git/objects/${dirName}/${fileName}`, compressedData);

    return hash;
  } catch (error) {
    console.error(error);
    return "ERROR";
  }
}
