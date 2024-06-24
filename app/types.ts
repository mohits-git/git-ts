export enum Commands {
  Init = "init",
  CatFile = "cat-file",
  HashObject = "hash-object",
  LsTree = "ls-tree",
  WriteTree = "write-tree"
}

export enum Modes {
  RegularFile = "100644",
  ExecutableFile = "100755",
  SymbolicFile = "120000", 
  Directory = "40000"
}

export enum Objects {
  Blob = "blob",
  Tree = "tree",
  Commit = "commit"
}
