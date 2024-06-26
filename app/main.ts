import { Commands } from "./types";
import { catFile, hashObject, init, lsTree, writeTree } from "./commands";

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case Commands.Init:
    init();
    break;
  case Commands.CatFile:
    if (args[1] === "-p") {
      const blobHash = args[2];
      catFile(blobHash);
    }
    break;
  case Commands.HashObject:
    if (args[1] === "-w") {
      const fileName = args[2];
      const hash = hashObject(`./${fileName}`);
      console.log(hash);
    }
    break;
  case Commands.LsTree:
    const sha = args[args.length - 1];
    const isNameOnly = args[1] === "--name-only";
    lsTree(sha, isNameOnly);
    break;
  case Commands.WriteTree:
    const hash = writeTree("./");
    console.log(hash);
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}

