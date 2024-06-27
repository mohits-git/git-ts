import fs from "fs";
import zlib from "zlib";
import { CommitTreeProps } from "./types";

export const getShaContent = (sha: string) => {
  const filePath = `.git/objects/${sha.substring(0, 2)}/${sha.substring(2)}`;
  const data = fs.readFileSync(filePath);
  return zlib.unzipSync(data);
}

export const getCommitTreeProps = (args: string[]): CommitTreeProps => {
    const data: CommitTreeProps = {
      treeSha: args[1],
      parentCommit: null,
      message: ""
    };
    if (args[2] === '-p') {
      data.parentCommit = args[3];
      data.message = args[5];
    } else if (args[2] === '-m') {
      data.message = args[3];
    }
    return data;
}
