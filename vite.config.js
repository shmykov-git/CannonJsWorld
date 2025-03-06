import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

//create public.json
function getDirJson(dir) {
  let totalCount = 0

  const res = fs
    .readdirSync(dir)
    .filter(folder => fs.statSync(path.join(dir, folder)).isDirectory())
    .sort()
    .reduce((acc, folder) => {
      acc[folder] = getDirJson(path.join(dir, folder))
      totalCount += acc[folder].totalCount
      return acc
    }, {})

  res.files = fs
    .readdirSync(dir)
    .filter(file => !fs.statSync(path.join(dir, file)).isDirectory())
    .sort()

  res.totalCount = totalCount + res.files.length

  return res
}
 
const publicJson = getDirJson("public")
fs.writeFileSync("public/public.json", JSON.stringify(publicJson, null, 2), "utf8")
console.log(`public.json created with total files count: ${publicJson.totalCount}`)
console.log()


// find build input files
function getHtmlFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter(file => file.endsWith('.html'))
    .reduce((entries, file) => {
      entries[path.parse(file).name] = path.resolve(dir, file);
      return entries;
    }, {});
}

const files = {
  ...getHtmlFiles("."),
  ...getHtmlFiles("views")
}

console.log(files)


// configure
export default defineConfig({
  type: "module",
  root:'.',
  build: {
    rollupOptions: {
      input: files,
    },
    outDir: './dist',
  },
  server: {
    host: '0.0.0.0',
    port: 3333,
  }
});
