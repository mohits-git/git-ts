import crypto from "crypto";
import zlib from "zlib";
import fs from "fs";
import { CommitTreeProps } from "../types";
import { getConfig } from "../helpers";

export const commitTree = ({ treeSha, parentCommit, message }: CommitTreeProps) => {
  const lines: string[] = [];
  lines.push(`tree ${treeSha}`);
  if(parentCommit) {
    lines.push(`parent ${parentCommit}`);
  }

  const timeStamp = Math.floor((new Date()).getTime()/1000);
  const utcOffset = (new Date()).getTimezoneOffset();
  const utcOffsetString = `${Math.floor(Math.abs(utcOffset/60))}${Math.abs(utcOffset%60)}`.padStart(4, '0');
  const utcOffsetSign = utcOffset >= 0 ? "-" : "+";

  const { author, mail } = getConfig();
  
  lines.push(`author ${author} <${mail}> ${timeStamp} ${utcOffsetSign}${utcOffsetString}`);
  lines.push(`committer ${author} <${mail}> ${timeStamp} ${utcOffsetSign}${utcOffsetString}`);
  lines.push('');
  lines.push(message);

  const content = lines.join('\n');

  const commitObject = Buffer.from(`commit ${content.length}\0${content}`);

  const compressedContent = zlib.deflateSync(commitObject);
  const hash = crypto.createHash('sha1').update(compressedContent).digest('hex');
  const dirName = hash.substring(0, 2);
  const fileName = hash.substring(2);
  try {
    fs.mkdirSync(`./.git/objects/${dirName}`, { recursive: true });
  } catch(error) { /* No action */ }
  fs.writeFileSync(`./.git/objects/${dirName}/${fileName}`, compressedContent);
  return hash;
}
