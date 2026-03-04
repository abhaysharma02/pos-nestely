import fs from 'fs';
import path from 'path';

const directories = [
    'src/pages',
    'src/components',
    'src/layouts',
    'src'
];

const replacements = [
    // Fix broken hover states first
    { target: /hover:dark:bg-neutral-900 bg-white/g, replacement: 'hover:bg-neutral-900 light:hover:bg-white' },
    { target: /hover:dark:bg-\[\#1e1e1e\] bg-gray-50/g, replacement: 'hover:bg-[#1e1e1e] light:hover:bg-gray-50' },
    { target: /hover:dark:bg-\[\#121212\] bg-gray-100/g, replacement: 'hover:bg-[#121212] light:hover:bg-gray-100' },
    { target: /hover:dark:text-white text-gray-900/g, replacement: 'hover:text-white light:hover:text-gray-900' },
    { target: /hover:dark:text-neutral-400 text-gray-500/g, replacement: 'hover:text-neutral-400 light:hover:text-gray-500' },
    { target: /hover:dark:text-neutral-300 text-gray-600/g, replacement: 'hover:text-neutral-300 light:hover:text-gray-600' },
    { target: /hover:dark:text-neutral-500 text-gray-400/g, replacement: 'hover:text-neutral-500 light:hover:text-gray-400' },
    { target: /hover:dark:bg-neutral-950 bg-gray-50/g, replacement: 'hover:bg-neutral-950 light:hover:bg-gray-50' },
    { target: /hover:dark:bg-neutral-800 bg-white/g, replacement: 'hover:bg-neutral-800 light:hover:bg-white' },
    { target: /hover:dark:border-neutral-800 border-gray-200/g, replacement: 'hover:border-neutral-800 light:hover:border-gray-200' },
    { target: /hover:dark:border-neutral-700 border-gray-300/g, replacement: 'hover:border-neutral-700 light:hover:border-gray-300' },
    { target: /hover:dark:bg-gray-800 bg-white/g, replacement: 'hover:bg-gray-800 light:hover:bg-white' },
    { target: /hover:dark:bg-gray-900 bg-gray-50/g, replacement: 'hover:bg-gray-900 light:hover:bg-gray-50' },
    { target: /hover:dark:border-gray-700 border-gray-200/g, replacement: 'hover:border-gray-700 light:hover:border-gray-200' },
    { target: /hover:dark:text-gray-400 text-gray-500/g, replacement: 'hover:text-gray-400 light:hover:text-gray-500' },
    { target: /hover:dark:text-gray-300 text-gray-600/g, replacement: 'hover:text-gray-300 light:hover:text-gray-600' },
    { target: /hover:dark:bg-gray-800\/50 bg-gray-100\/50/g, replacement: 'hover:bg-gray-800/50 light:hover:bg-gray-100/50' },
    { target: /hover:dark:bg-neutral-800\/50 bg-gray-100\/50/g, replacement: 'hover:bg-neutral-800/50 light:hover:bg-gray-100/50' },

    // Normal non-hover states
    { target: /dark:bg-neutral-900 bg-white/g, replacement: 'bg-neutral-900 light:bg-white' },
    { target: /dark:bg-\[\#1e1e1e\] bg-gray-50/g, replacement: 'bg-[#1e1e1e] light:bg-gray-50' },
    { target: /dark:bg-\[\#121212\] bg-gray-100/g, replacement: 'bg-[#121212] light:bg-gray-100' },
    { target: /dark:text-white text-gray-900/g, replacement: 'text-white light:text-gray-900' },
    { target: /dark:text-neutral-400 text-gray-500/g, replacement: 'text-neutral-400 light:text-gray-500' },
    { target: /dark:text-neutral-300 text-gray-600/g, replacement: 'text-neutral-300 light:text-gray-600' },
    { target: /dark:text-neutral-500 text-gray-400/g, replacement: 'text-neutral-500 light:text-gray-400' },
    { target: /dark:bg-neutral-950 bg-gray-50/g, replacement: 'bg-neutral-950 light:bg-gray-50' },
    { target: /dark:bg-neutral-800 bg-white/g, replacement: 'bg-neutral-800 light:bg-white' },
    { target: /dark:border-neutral-800 border-gray-200/g, replacement: 'border-neutral-800 light:border-gray-200' },
    { target: /dark:border-neutral-700 border-gray-300/g, replacement: 'border-neutral-700 light:border-gray-300' },
    { target: /dark:bg-gray-800 bg-white/g, replacement: 'bg-gray-800 light:bg-white' },
    { target: /dark:bg-gray-900 bg-gray-50/g, replacement: 'bg-gray-900 light:bg-gray-50' },
    { target: /dark:border-gray-700 border-gray-200/g, replacement: 'border-gray-700 light:border-gray-200' },
    { target: /dark:text-gray-400 text-gray-500/g, replacement: 'text-gray-400 light:text-gray-500' },
    { target: /dark:text-gray-300 text-gray-600/g, replacement: 'text-gray-300 light:text-gray-600' },
    { target: /dark:bg-gray-800\/50 bg-gray-100\/50/g, replacement: 'bg-gray-800/50 light:bg-gray-100/50' },
    { target: /dark:bg-neutral-800\/50 bg-gray-100\/50/g, replacement: 'bg-neutral-800/50 light:bg-gray-100/50' }
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            continue;
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
                console.log(`Reverted & Patched: ${fullPath}`);
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

console.log('Patch complete.');
