import { getShaContent } from "../helpers";
import { Modes, Objects } from "../types";

export const lsTree = (sha: string, isNameOnly: boolean) => {
    const treeObjectBuffer = getShaContent(sha);
    const treeObject = treeObjectBuffer.toString('binary');
    const output: string[] = [];
    const entries = treeObject.split(' ');
    if (isNameOnly) {
      for (let i = 2; i < entries.length; i++) {
        const nullIndex = entries[i].indexOf('\0');
        const fileName = entries[i].substring(0, nullIndex);
        output.push(fileName);
      }
    }
    else {
      const ni = entries[1].indexOf('\0');
      entries[1] = entries[1].substring(ni + 1);

      for (let i = 2; i < entries.length; i++) {
        const line = [];
        line.push(entries[i - 1]);
        if (entries[i - 1] === Modes.Directory) {
          line.push(Objects.Tree)
        } else line.push(Objects.Blob)
        const nullIndex = entries[i].indexOf('\0');
        const fileName = entries[i].substring(0, nullIndex);
        const sha = entries[i].substring(nullIndex + 1, nullIndex + 21);
        entries[i] = entries[i].substring(nullIndex + 21);
        const buf = Buffer.from(sha, 'binary');
        const hex = buf.toString('hex');
        line.push(hex);
        output.push(`${line.join(' ')}    ${fileName}`);
      }
    }
    const outputString = output.join('\n');
    console.log(outputString);
}
