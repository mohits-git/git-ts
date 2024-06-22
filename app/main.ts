import * as fs from "fs";
import zlib from 'node:zlib';
import crypto from "crypto";
import { Commands } from "./types";

const args = process.argv.slice(2);
const command = args[0];

const getShaContent = (sha: string) => {
  const filePath = `.git/objects/${sha.substring(0, 2)}/${sha.substring(2)}`;
  const data = fs.readFileSync(filePath);
  const decompressed = zlib.unzipSync(data);
  return decompressed.toString('utf8');
}

const getShaFromNext = (entries: string[], i: number): string => {
  const nextEntry = entries[i + 1].split(' ');
  let sha;
  if (nextEntry.length > 1) {
    const mode = nextEntry[0].substring(nextEntry[0].length - 6);
    if (mode.endsWith('40000')) sha = nextEntry[0].substring(0, nextEntry[0].length - 5);
    else sha = nextEntry[0].substring(0, nextEntry[0].length - 6);
  }
  else {
    sha = i + 2 < entries.length
      ? nextEntry[0] + '\0' + getShaFromNext(entries, i + 1)
      : nextEntry[0];
  }
  return sha;
}

switch (command) {
  case Commands.Init:
    fs.mkdirSync(".git", { recursive: true });
    fs.mkdirSync(".git/objects", { recursive: true });
    fs.mkdirSync(".git/refs", { recursive: true });
    fs.writeFileSync(".git/HEAD", "ref: refs/heads/main\n");
    console.log("Initialized git directory");
    break;
  case Commands.CatFile:
    if (args[1] === "-p") {
      const blobHash = args[2];
      const stringData = getShaContent(blobHash);
      const content = stringData.split('\0')[1];
      process.stdout.write(content);
    }
    break;
  case Commands.HashObject:
    if (args[1] === "-w") {
      const fileName = args[2];
      const fileContent = fs.readFileSync(`./${fileName}`);
      const blobContent = `blob ${fileContent.toString('utf8').length}\0${fileContent.toString('utf8')}`
      const compressedContent = zlib.deflateSync(blobContent);
      const hash = crypto.createHash('sha1', compressedContent).digest('hex');
      const dirName = hash.substring(0, 2);
      const blobObjectFile = hash.substring(2);
      fs.mkdirSync(`./.git/objects/${dirName}`, { recursive: true });
      fs.writeFileSync(`./.git/objects/${dirName}/${blobObjectFile}`, compressedContent);
      console.log(hash);
    }
    break;
  case Commands.LsTree:
    const sha = args[args.length - 1];
    const treeObject = getShaContent(sha);
    console.log(treeObject);
    console.log('---------------------------')
    const output: string[] = [];
    const entries = treeObject.split('\0');
    console.log(entries);
    console.log('---------------------------')
    if (args[1] === "--name-only") {
      for (let i = 1; i < entries.length; i++) {
        const splitEntries = entries[i].split(' ');
        if (splitEntries.length > 1)
          output.push(splitEntries[splitEntries.length - 1]);
      }
    }
    else {
      for (let i = 1; i < entries.length; i++) {
        const line = [];
        const splitEntries = entries[i].split(' ');
        if (splitEntries.length > 1) {
          const mode = splitEntries[0].substring(splitEntries[0].length - 6);
          let modeLength = 6;
          if (mode.endsWith("40000")) {
            line.push("40000");
            line.push("tree");
            modeLength = 5;
          }
          else {
            line.push(mode);
            line.push("blob");
          }
          const sha = getShaFromNext(entries, i);
          const buf = Buffer.from(sha, 'latin1');
          const hex = buf.toString('hex');
          line.push(hex);
          output.push(`${line.join(' ')}\t${splitEntries[splitEntries.length - 1]}`);
        }
      }
    }
    const outputString = output.join('\n');
    console.log(outputString);
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}

