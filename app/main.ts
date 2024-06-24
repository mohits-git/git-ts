import * as fs from "fs";
import zlib from 'node:zlib';
import crypto from "crypto";
import { Commands, Modes, Objects } from "./types";

const args = process.argv.slice(2);
const command = args[0];

const getShaContent = (sha: string) => {
  const filePath = `.git/objects/${sha.substring(0, 2)}/${sha.substring(2)}`;
  const data = fs.readFileSync(filePath);
  return zlib.unzipSync(data);
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
      const stringData = getShaContent(blobHash).toString('utf8');
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
    const treeObjectBuffer = getShaContent(sha);
    const treeObject = treeObjectBuffer.toString('binary');
    const output: string[] = [];
    const entries = treeObject.split(' ');
    if (args[1] === "--name-only") {
      for (let i = 2; i < entries.length; i++) {
        const nullIndex = entries[i].indexOf('\0');
        const fileName = entries[i].substring(0, nullIndex);
        output.push(fileName);
      }
    }
    else {
      const ni = entries[1].indexOf('\0');
      entries[1] = entries[1].substring(ni+1);

      for (let i = 2; i < entries.length; i++) {
        const line = [];
        line.push(entries[i-1]);
        if(entries[i-1] === Modes.Directory) {
          line.push(Objects.Tree)
        } else line.push(Objects.Blob)
        const nullIndex = entries[i].indexOf('\0');
        const fileName = entries[i].substring(0, nullIndex);
        const sha = entries[i].substring(nullIndex+1, nullIndex+21);
        entries[i] = entries[i].substring(nullIndex+21);
        const buf = Buffer.from(sha, 'binary');
        const hex = buf.toString('hex');
        line.push(hex);
        output.push(`${line.join(' ')}    ${fileName}`);
      }
    }
    const outputString = output.join('\n');
    console.log(outputString);
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}

