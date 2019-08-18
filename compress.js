const compressedCSS = 'style.min.css';
const compressedJS = 'main.min.js';

var fs = require('fs');

var path = require('path');

var uglifycss = require('uglifycss');

compressCSS();

function compressCSS() {
    console.log('\n----------\n\n Сборка CSS-файлов\n');

    var styles = [];

    var code = '';

    walk(path.join(__dirname, '/css'), (err, results) => {
        if (err) throw err;

        styles = results;

        for (let i in styles) {
            if (styles[i].indexOf('.min.') == -1 && styles[i].indexOf('colors.css') == -1) {
                console.log('  - ' + styles[i]);

                code += fs.readFileSync(styles[i], 'utf-8');

                code += '\n';
            }
        }

        console.log(`\n CSS-файлы собраны в ${compressedCSS}\n`);

        console.log(` Сжатие ${compressedCSS}\n`);

        let uglified = uglifycss.processString(code, { maxLineLen: 500, expandVars: false });

        fs.writeFileSync(path.join(__dirname, '/css', compressedCSS), uglified);

        console.log(' Успешно\n\n----------');

        compressJS();
    });
}

function compressJS() {
    console.log('\n Сборка JS-файлов\n');

    var jsObfuscator = require('javascript-obfuscator');

    var scripts = [];

    var code = '';

    walk(path.join(__dirname, '/js'), (err, results) => {
        if (err) throw err;

        scripts = results;

        for (let i in scripts) {
            if (scripts[i].indexOf('.min.') == -1) {
                console.log('  - ' + scripts[i]);

                code += fs.readFileSync(scripts[i], 'utf-8');

                code += '\n';
            }
        }

        console.log(`\n JS-файлы собраны в ${compressedJS}\n`);

        console.log(` Сжатие и обфускация ${compressedJS}\n`);

        let obfuscatedcode = jsObfuscator.obfuscate(code, { compact: true, debugProtection: true });

        fs.writeFileSync(path.join(__dirname, '/js', compressedJS), obfuscatedcode);

        console.log(' Успешно\n\n----------\n');
    });
}

function walk(dir, done) {
    var results = [];

    fs.readdir(dir, function(err, list) {
        if (err)
            return done(err);

        var i = 0;

        (function next() {
            var file = list[i++];

            if (!file) return done(null, results);

            file = path.join(dir, file);

            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};