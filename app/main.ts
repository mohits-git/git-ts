import * as fs from "fs";
import zlib from 'node:zlib';

const args = process.argv.slice(2);
const command = args[0];

enum Commands {
    Init = "init",
    CatFile = "cat-file"
}

switch (command) {
    case Commands.Init:
        console.log("Logs from your program will appear here!");

        fs.mkdirSync(".git", { recursive: true });
        fs.mkdirSync(".git/objects", { recursive: true });
        fs.mkdirSync(".git/refs", { recursive: true });
        fs.writeFileSync(".git/HEAD", "ref: refs/heads/main\n");
        console.log("Initialized git directory");
        break;
    case Commands.CatFile:
        if(args[1] === "-p") {
            const blobHash = args[2];
            const filePath = `.git/objects/${blobHash.substring(0, 2)}/${blobHash.substring(2)}`;
            const data = fs.readFileSync(filePath);
            const decompressed = zlib.unzipSync(data);
            const stringData = decompressed.toString('utf8');
            const content = stringData.split('\0')[1];
            process.stdout.write(content);
        }
        break;
    default:
        throw new Error(`Unknown command ${command}`);
}
