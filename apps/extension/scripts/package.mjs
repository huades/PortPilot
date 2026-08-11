import JSZip from "jszip";
import { readdir, readFile, writeFile } from "node:fs/promises";
const zip=new JSZip();
const dist=new URL("../dist/",import.meta.url);
async function addDirectory(directory,prefix=""){
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const path=new URL(entry.name+(entry.isDirectory()?"/":""),directory);
    const name=`${prefix}${entry.name}`;
    if(entry.isDirectory())await addDirectory(path,`${name}/`);
    else zip.file(name,await readFile(path));
  }
}
await addDirectory(dist);
await writeFile(new URL("../portpilot-extension.zip",import.meta.url),await zip.generateAsync({type:"nodebuffer"}));
