import { getShaContent } from "../helpers";

export const catFile = (blobHash: string) => {
  const stringData = getShaContent(blobHash).toString('utf8');
  const content = stringData.split('\0')[1];
  process.stdout.write(content);
}
