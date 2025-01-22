import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

function getAllFiles(dir) {
  return fs
    .readdirSync(dir)
    .reduce((entries, file) => {
      entries[path.parse(file).name] = path.resolve(dir, file);
      return entries;
    }, {});
}

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
