const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src', 'components', 'templates');
const templates = ['BotaniTemplate.jsx', 'EmeraldTemplate.jsx', 'NaturaTemplate.jsx', 'OlanTemplate.jsx'];

templates.forEach(file => {
    const filePath = path.join(templatesDir, file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // First remove any existing <AnimatedSection> wrappers to avoid double wrapping
    content = content.replace(/<AnimatedSection[^>]*>/g, '');
    content = content.replace(/<\/AnimatedSection>/g, '');
    content = content.replace(/import AnimatedSection from '..\/AnimatedSection';\n/g, '');

    // Now insert import
    content = content.replace(/import React(.*?)from ['"]react['"];\n/, "import React$1from 'react';\nimport AnimatedSection from '../AnimatedSection';\n");

    // Replace <section> with <AnimatedSection><section>
    content = content.replace(/(<section[^>]*>)/g, '<AnimatedSection animation="fadeUp">\n$1');
    content = content.replace(/(<\/section>)/g, '$1\n</AnimatedSection>');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${file}`);
});
