import fs from 'fs';
import path from 'path';
import * as esbuild from 'esbuild';

const PROJECT_ROOT = process.cwd();
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

async function run() {
    console.log('🚀 Cleaning JS assets and generating modular mBlox builds...');

    try {
        // Clean JS files only, keeping mBloxBS.css compiled by build-css.js
        if (fs.existsSync(DIST_DIR)) {
            const files = fs.readdirSync(DIST_DIR);
            for (const file of files) {
                if (file.endsWith('.js') || file.startsWith('chunk-') || file === 'src') {
                    fs.rmSync(path.join(DIST_DIR, file), { recursive: true, force: true });
                }
            }
            console.log('🧹 Cleaned JS files in dist/.');
        } else {
            fs.mkdirSync(DIST_DIR, { recursive: true });
        }
    } catch (err) {
        console.warn('⚠️ Warning: Failed to clean dist/ directory:', err.message);
    }

    // Copy Bootstrap JS bundle to dist/mBloxBS.js
    const bootstrapJsSrc = path.join(PROJECT_ROOT, 'node_modules', 'bootstrap', 'dist', 'js', 'bootstrap.bundle.min.js');
    const bootstrapJsDest = path.join(DIST_DIR, 'mBloxBS.js');
    if (fs.existsSync(bootstrapJsSrc)) {
        fs.copyFileSync(bootstrapJsSrc, bootstrapJsDest);
        console.log('📦 Copied Bootstrap JS bundle to dist/mBloxBS.js');
    } else {
        console.warn('⚠️ Warning: Bootstrap JS bundle not found in node_modules.');
    }

    const entryPoints = {
        mBloxCall: path.join(PROJECT_ROOT, 'mBloxCall.js'),
        mBloxEngine: path.join(SRC_DIR, 'core', 'engine.js'),
        uiBootstrap: path.join(SRC_DIR, 'design', 'ui-bootstrap.js'),
        mBloxCard: path.join(SRC_DIR, 'blocks', 'card.js'),
        mBloxList: path.join(SRC_DIR, 'blocks', 'list.js'),
        mBloxCover: path.join(SRC_DIR, 'blocks', 'cover.js'),
        mBloxPancake: path.join(SRC_DIR, 'blocks', 'pancake.js'),
        mBloxStack: path.join(SRC_DIR, 'blocks', 'stack.js'),
        mBloxQuote: path.join(SRC_DIR, 'blocks', 'quote.js'),
        mBloxComment: path.join(SRC_DIR, 'blocks', 'comment.js'),
        mBloxShowcase: path.join(SRC_DIR, 'blocks', 'showcase.js'),
        mBloxGallery: path.join(SRC_DIR, 'blocks', 'gallery.js')
    };

    // Filter to only compile files that actually exist
    const validEntryPoints = {};
    for (const [key, val] of Object.entries(entryPoints)) {
        if (fs.existsSync(val)) {
            validEntryPoints[key] = val;
        } else {
            console.warn(`⚠️ Warning: Entry point file does not exist: ${val}`);
        }
    }

    if (Object.keys(validEntryPoints).length === 0) {
        console.log('No valid entry point files found. Skipping JS build.');
        return;
    }

    try {
        await esbuild.build({
            entryPoints: validEntryPoints,
            bundle: true,
            minify: true,
            splitting: false, // Turn off splitting to prevent chunk-XXXX.js generation
            format: 'esm',
            target: ['es2020'],
            outdir: DIST_DIR,
            banner: {
                js: `/*! mBlox Modular JS | Generated: ${new Date().toISOString()} */`,
            },
        });

        console.log(`✅ Build complete! Files generated in /dist`);
    } catch (err) {
        console.error('❌ Build failed:', err);
    }
}

run();
