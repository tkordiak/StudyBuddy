import mammoth from 'mammoth';

export async function parseFile(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.toLowerCase().split('.').pop();

  try {
    switch (ext) {
      case 'pdf':
        return await parsePdfFile(buffer);
      case 'docx':
        return await parseDocxFile(buffer);
      case 'doc':
        return await parseDocFile(buffer);
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  } catch (error) {
    console.error('File parsing error:', error);
    throw new Error(`Failed to parse ${ext?.toUpperCase()} file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function parsePdfFile(buffer: Buffer): Promise<string> {
  // Dynamically import pdf-parse to avoid module loading issues
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return cleanText(data.text);
}

async function parseDocxFile(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return cleanText(result.value);
}

async function parseDocFile(buffer: Buffer): Promise<string> {
  // For .doc files, we'll try mammoth as well
  const result = await mammoth.extractRawText({ buffer });
  return cleanText(result.value);
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export function validateResumeContent(text: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (text.length < 100) {
    errors.push('Resume content is too short (minimum 100 characters)');
  }

  if (text.length > 10000) {
    errors.push('Resume content is too long (maximum 10,000 characters)');
  }

  // Check for basic resume sections
  const hasExperience = /experience|employment|work|career/i.test(text);
  const hasSkills = /skills|competencies|abilities/i.test(text);
  
  if (!hasExperience && !hasSkills) {
    errors.push('Resume should contain experience or skills information');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
