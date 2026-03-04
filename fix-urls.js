import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.join(__dirname, 'frontend', 'src');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            /* Recurse into a subdirectory */
            results = results.concat(walkDir(file));
        } else {
            /* Is a file */
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walkDir(directoryPath);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace single quote definitions
    content = content.replace(/'http:\/\/localhost:8080\/(.*?)'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/$1`");

    // Replace double quote definitions
    content = content.replace(/"http:\/\/localhost:8080\/(.*?)"/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/$1`");

    // Replace backtick definitions that already have variables inside them
    content = content.replace(/`http:\/\/localhost:8080\/(.*?)`/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/$1`");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated API URLs in: ${file}`);
    }
});
console.log('Complete!');
