import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import puppeteer from 'puppeteer';
import { marked } from 'marked';

export async function generateDocx(content: string, title: string): Promise<Buffer> {
  // Parse markdown and convert to docx format
  const lines = content.split('\n');
  const paragraphs: Paragraph[] = [];

  let currentList: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed) {
      if (currentList.length > 0) {
        // Add list items
          currentList.forEach(item => {
            paragraphs.push(
              new Paragraph({ text: item, bullet: { level: 0 } }),
            );
          });
        currentList = [];
      }
      paragraphs.push(new Paragraph({ children: [new TextRun("")] }));
      continue;
    }

    // Handle headers
    if (trimmed.startsWith('###')) {
      paragraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({ text: trimmed.substring(3).trim(), bold: true })],
      }));
    } else if (trimmed.startsWith('##')) {
      paragraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: trimmed.substring(2).trim(), bold: true })],
      }));
    } else if (trimmed.startsWith('#')) {
      paragraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: trimmed.substring(1).trim(), bold: true })],
      }));
    }
    // Handle list items
    else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      currentList.push(trimmed.substring(1).trim());
    }
    // Handle bold text
    else if (trimmed.includes('**')) {
      const parts = trimmed.split('**');
      const children: TextRun[] = [];
      for (let i = 0; i < parts.length; i++) {
        children.push(new TextRun({ 
          text: parts[i], 
          bold: i % 2 === 1 
        }));
      }
      paragraphs.push(new Paragraph({ children }));
    }
    // Regular paragraph
    else {
      paragraphs.push(new Paragraph({
        children: [new TextRun(trimmed)],
      }));
    }
  }

  // Add remaining list items
  if (currentList.length > 0) {
    currentList.forEach(item => {
      paragraphs.push(
        new Paragraph({ text: item, bullet: { level: 0 } }),
      );
    });
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });

  return await Packer.toBuffer(doc);
}

export async function generatePdf(content: string, title: string): Promise<Buffer> {
  const html = await marked(content);
  
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Times New Roman', serif;
          font-size: 11pt;
          line-height: 1.4;
          margin: 0.5in;
          color: #000;
        }
        h1, h2, h3 {
          margin-top: 16px;
          margin-bottom: 8px;
        }
        h1 { font-size: 16pt; font-weight: bold; }
        h2 { font-size: 14pt; font-weight: bold; border-bottom: 1px solid #000; }
        h3 { font-size: 12pt; font-weight: bold; }
        p { margin: 4px 0; }
        ul { margin: 4px 0; padding-left: 20px; }
        li { margin: 2px 0; }
        strong { font-weight: bold; }
        @media print {
          body { margin: 0.5in; }
          @page { margin: 0.5in; }
        }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true
    });

    return Buffer.from(pdf);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
