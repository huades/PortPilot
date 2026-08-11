import { cp, mkdir, rm } from "node:fs/promises";
if(process.argv.includes("clean")){await rm(new URL("../dist",import.meta.url),{recursive:true,force:true});process.exit(0)}
await mkdir(new URL("../dist",import.meta.url),{recursive:true});
for(const file of ["manifest.json","popup.html","popup.css"])await cp(new URL(`../src/${file}`,import.meta.url),new URL(`../dist/${file}`,import.meta.url));
await cp(new URL("../src/icons",import.meta.url),new URL("../dist/icons",import.meta.url),{recursive:true});
