import fs from 'fs';
import path from 'path';
import * as esbuild from 'esbuild';
import yaml from 'js-yaml';

const PROJECT_ROOT = process.cwd();
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const CONFIG_DIR = path.join(PROJECT_ROOT, 'config');
const JS_YAML = path.join(CONFIG_DIR, 'BSjsComponents.yaml');
const OUTPUT_FILE = path.join(DIST_DIR, 'mBloxBS.js');
const TEMP_ENTRY = path.join(CONFIG_DIR, 'bootstrap-entry.temp.js');

async function run() {
    console.log('🚀 Generating mBloxBS.js...');

    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR, { recursive: true });
    }

    // 1. Load components from YAML
    if (!fs.existsSync(JS_YAML)) {
        console.error(`❌ BSjsComponents.yaml not found: ${JS_YAML}`);
        return;
    }
    const config = yaml.load(fs.readFileSync(JS_YAML, 'utf8'));
    const components = config.components || [];

    // 2. Generate temporary entry point
    console.log(`📦 Bundling components: ${components.join(', ')}...`);
    let entryContent = `// Auto-generated entry point\nwindow.bootstrap = window.bootstrap || {};\n`;
    
    components.forEach(comp => {
        const capitalized = comp.charAt(0).toUpperCase() + comp.slice(1);
        entryContent += `import ${capitalized} from 'bootstrap/js/dist/${comp}';\n`;
        entryContent += `window.bootstrap.${capitalized} = ${capitalized};\n`;
    });

    fs.writeFileSync(TEMP_ENTRY, entryContent);

    // 3. Build with esbuild
    try {
        await esbuild.build({
            entryPoints: [TEMP_ENTRY],
            bundle: true,
            minify: true,
            format: 'iife',
            target: ['es2015'],
            outfile: OUTPUT_FILE,
            banner: {
                js: `/*! mBloxBS.js - Custom Bootstrap JS Bundle | Generated: ${new Date().toISOString()} */`,
            },
        });

        const stats = fs.statSync(OUTPUT_FILE);
        console.log(`✅ Build complete! Final size: ${(stats.size / 1024).toFixed(2)} KB`);
    } catch (err) {
        console.error('❌ Build failed:', err);
    } finally {
        // Cleanup temp file
        if (fs.existsSync(TEMP_ENTRY)) {
            fs.unlinkSync(TEMP_ENTRY);
        }
    }
}

run();
