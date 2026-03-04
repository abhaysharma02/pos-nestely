import fs from 'fs';
import path from 'path';

const directories = [
    'src/pages',
    'src/components',
    'src/layouts',
    'src'
];

const replacements = [
    { target: /bg-neutral-900/g, replacement: 'dark:bg-neutral-900 bg-white' },
    { target: /bg-\[\#1e1e1e\]/g, replacement: 'dark:bg-[#1e1e1e] bg-gray-50' },
    { target: /bg-\[\#121212\]/g, replacement: 'dark:bg-[#121212] bg-gray-100' },
    { target: /(?<!-)text-white(?!-)/g, replacement: 'dark:text-white text-gray-900' },
    { target: /text-neutral-400/g, replacement: 'dark:text-neutral-400 text-gray-500' },
    { target: /text-neutral-300/g, replacement: 'dark:text-neutral-300 text-gray-600' },
    { target: /text-neutral-500/g, replacement: 'dark:text-neutral-500 text-gray-400' },
    { target: /bg-neutral-950/g, replacement: 'dark:bg-neutral-950 bg-gray-50' },
    { target: /bg-neutral-800/g, replacement: 'dark:bg-neutral-800 bg-white' },
    { target: /border-neutral-800/g, replacement: 'dark:border-neutral-800 border-gray-200' },
    { target: /border-neutral-700/g, replacement: 'dark:border-neutral-700 border-gray-300' },
    { target: /bg-gray-800(?![\/\-])/g, replacement: 'dark:bg-gray-800 bg-white' },
    { target: /bg-gray-900/g, replacement: 'dark:bg-gray-900 bg-gray-50' },
    { target: /border-gray-700/g, replacement: 'dark:border-gray-700 border-gray-200' },
    { target: /text-gray-400/g, replacement: 'dark:text-gray-400 text-gray-500' },
    { target: /text-gray-300/g, replacement: 'dark:text-gray-300 text-gray-600' },
    { target: /bg-gray-800\/50/g, replacement: 'dark:bg-gray-800/50 bg-gray-100/50' },
    { target: /bg-neutral-800\/50/g, replacement: 'dark:bg-neutral-800/50 bg-gray-100/50' }
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            continue; // Not recursive right now, doing it manually via list
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            for (const { target, replacement } of replacements) {
                if (target.test(content)) {
                    content = content.replace(target, replacement);
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

directories.forEach(d => {
    const fullDir = path.join(process.cwd(), d);
    if (fs.existsSync(fullDir)) {
        processDirectory(fullDir);
    }
});

console.log('Refactoring complete.');
