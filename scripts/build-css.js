import fs from 'fs';
import path from 'path';
import { PurgeCSS } from 'purgecss';
import * as sass from 'sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import yaml from 'js-yaml';

const PROJECT_ROOT = process.cwd();
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const CONFIG_DIR = path.join(PROJECT_ROOT, 'config');
const OUTPUT_FILE = path.join(DIST_DIR, 'mBloxBS.css');
const CLASSES_YAML = path.join(CONFIG_DIR, 'BScssClasses.yaml');

// Bootstrap SCSS entry point
const BOOTSTRAP_SCSS = path.join(PROJECT_ROOT, 'node_modules', 'bootstrap', 'scss', 'bootstrap.scss');

async function run() {
    console.log('🚀 Generating mBloxBS.css...');

    // Ensure dist directory exists
    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR, { recursive: true });
    }

    // 1. Compile Bootstrap to CSS
    console.log('📦 Compiling Bootstrap...');
    if (!fs.existsSync(BOOTSTRAP_SCSS)) {
        console.error(`❌ Bootstrap SCSS not found: ${BOOTSTRAP_SCSS}`);
        console.error('Please run "npm install" in the project root.');
        return;
    }

    const result = sass.compile(BOOTSTRAP_SCSS, {
        style: 'expanded',
        loadPaths: [path.join(PROJECT_ROOT, 'node_modules')],
        quietDeps: true,
        logger: {
            warn(message, options) {
                // Ignore deprecation warnings from dependencies
                if (options.deprecation) return;
                console.warn(message);
            }
        }
    });
    let bootstrapCss = result.css;

    // 2. Load config from YAML
    console.log('📂 Loading config from YAML...');
    if (!fs.existsSync(CLASSES_YAML)) {
        console.error(`❌ classes.yaml not found: ${CLASSES_YAML}`);
        return;
    }
    
    const config = yaml.load(fs.readFileSync(CLASSES_YAML, 'utf8'));
    
    // Helper to extract all static classes (everything except 'safelist' key)
    const extractStaticClasses = (obj) => {
        let classes = [];
        for (const key in obj) {
            if (key === 'safelist') continue;
            if (Array.isArray(obj[key])) {
                classes = classes.concat(obj[key]);
            } else if (typeof obj[key] === 'object') {
                classes = classes.concat(extractStaticClasses(obj[key]));
            }
        }
        return classes;
    };

    const yamlClasses = extractStaticClasses(config).filter(c => typeof c === 'string' && c.trim() !== '');
    console.log(`✅ Loaded ${yamlClasses.length} static classes from YAML.`);

    // 3. Prepare Safelist RegEx from YAML
    const parseRegex = (arr) => (arr || []).map(str => new RegExp(str));
    
    const safelistConfig = config.safelist || {};
    const safelist = {
        standard: [...yamlClasses, ...parseRegex(safelistConfig.standard)],
        deep: parseRegex(safelistConfig.deep),
        greedy: parseRegex(safelistConfig.greedy)
    };
    
    console.log('🧹 Purging unused styles...');
    
    const dummyHtml = yamlClasses.map(c => `<div class="${c}"></div>`).join('\n');

    const purged = await new PurgeCSS().purge({
        content: [
            { raw: dummyHtml, extension: 'html' }
        ],
        css: [{ raw: bootstrapCss }],
        safelist: safelist
    });

    // 4. Post-process with Autoprefixer and Custom Hardening
    console.log('💅 Post-processing (Autoprefixer & Hardening)...');
    
    /**
     * PostCSS plugin to "harden" structural CSS items by adding !important
     * and remove it from decorative elements like colors and fonts.
     */
    const mbloxHarden = {
        postcssPlugin: 'mblox-harden',
        Once(root) {
            // Structural properties that MUST have !important for layout integrity
            const STRUCTURAL = new Set([
                'display', 'position', 'top', 'right', 'bottom', 'left', 'float', 'clear',
                'flex', 'flex-basis', 'flex-direction', 'flex-grow', 'flex-shrink', 'flex-wrap',
                'justify-content', 'align-items', 'align-content', 'align-self',
                'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
                'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
                'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                'gap', 'row-gap', 'column-gap',
                'grid', 'grid-template-columns', 'grid-template-rows', 'grid-area', 'grid-column', 'grid-row',
                'box-sizing', 'overflow', 'overflow-x', 'overflow-y', 'visibility', 'z-index',
                'aspect-ratio', 'object-fit', 'object-position', 'vertical-align',
                'clip', 'clip-path', 'white-space', 'text-align'
            ]);

            // Decorative properties that should NOT have !important to allow host overrides
            const DECORATIVE = new Set([
                'color', 'background', 'background-color', 'background-image', 'border-color', 'outline-color',
                'font', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
                'text-decoration', 'text-transform', 'letter-spacing',
                'box-shadow', 'opacity', 'filter', 'backdrop-filter'
            ]);

            root.walkDecls(decl => {
                // Ignore CSS variables
                if (decl.prop.startsWith('--')) return;

                // Normalize property name (remove prefixes)
                const prop = decl.prop.toLowerCase().replace(/^-(webkit|moz|ms|o)-/, '');

                // Fix appearance compatibility: ensure standard property exists if prefixed is present
                if (prop === 'appearance' && decl.prop !== 'appearance') {
                    const rule = decl.parent;
                    if (rule && !rule.some(i => i.prop === 'appearance')) {
                        rule.insertAfter(decl, decl.clone({ prop: 'appearance' }));
                    }
                }

                if (STRUCTURAL.has(prop)) {
                    decl.important = true;
                } else if (DECORATIVE.has(prop)) {
                    decl.important = false;
                }
            });
        }
    };

    let finalCss = purged[0].css.replace(/@charset "UTF-8";/g, '').trim();
    const processed = await postcss([autoprefixer, mbloxHarden]).process(finalCss, { from: undefined });
    finalCss = processed.css;

    // 5. Wrap in @layer mblox and add header
    console.log('🏗️  Applying Layer Isolation...');
    const header = `/*!
 * mBloxBS.css - Custom Bootstrap Extraction for mBlox
 * Generated on: ${new Date().toISOString()}
 */
@charset "UTF-8";

@layer mblox {
`;
    const footer = `\n}`;
    
    finalCss = header + finalCss + footer;

    // 6. Save
    console.log(`💾 Saving to ${OUTPUT_FILE}...`);
    fs.writeFileSync(OUTPUT_FILE, finalCss);
    
    const stats = fs.statSync(OUTPUT_FILE);
    const sizeInKb = (stats.size / 1024).toFixed(2);
    console.log(`✅ Build complete! Final size: ${sizeInKb} KB`);
}

run().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
