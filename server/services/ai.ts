import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

const SYSTEM_PROMPT = `You are a precise career writing assistant that creates ATS-friendly, quantified, company-specific materials. Output clean Markdown without code fences.
Never invent employment dates or employers; use provided resume only.
If data is missing, ask for it briefly in a single line at the top, prefixed with "MISSING:".`;

export interface GenerateRequest {
  company: string;
  role: string;
  jobUrl?: string;
  resumeText: string;
  jdExtract?: string;
}

export interface GenerateResponse {
  tailoredResumeMd: string;
  coverLetterMd: string;
  tokensUsed: number;
}

export async function generateTailoredMaterials(request: GenerateRequest): Promise<GenerateResponse> {
  const { company, role, resumeText, jdExtract } = request;

  // Basic validation
  if (resumeText.length < 400) {
    throw new Error("MISSING: Please provide more detailed resume content (minimum 400 characters)");
  }

  const userPrompt = `Task: Generate two artifacts: (1) a one-page ATS-friendly resume, (2) a 250–400 word cover letter.
Target Role: ${role}
Company: ${company}
Company Info (from job URL if provided, else "N/A"):
${jdExtract || "N/A"}

Candidate Resume (normalized text):
${resumeText}

Constraints:
- Resume: one page, strong section order: Summary, Skills (keywords from JD), Experience (bulleted, quantified),
  Education, Certifications (if any). Avoid tables; use short, dense bullets (max 1–2 lines each).
- Tailor language to the company's known products, markets, and tone. Include relevant keywords explicitly.
- Cover letter: 3–5 paragraphs, mention 1–2 specific company facts from JD or known public info in jdExtract,
  connect 2–3 quantified achievements, end with a clear CTA.
- Output exactly two headings: "## Tailored Resume" and "## Cover Letter" with content beneath each.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated from AI");
    }

    // Split content by headings
    const sections = content.split('## ');
    let tailoredResumeMd = '';
    let coverLetterMd = '';

    for (const section of sections) {
      if (section.toLowerCase().startsWith('tailored resume')) {
        tailoredResumeMd = section.replace(/^tailored resume\s*/i, '').trim();
      } else if (section.toLowerCase().startsWith('cover letter')) {
        coverLetterMd = section.replace(/^cover letter\s*/i, '').trim();
      }
    }

    if (!tailoredResumeMd || !coverLetterMd) {
      throw new Error("Failed to extract both resume and cover letter from AI response");
    }

    return {
      tailoredResumeMd,
      coverLetterMd,
      tokensUsed: response.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error(`Failed to generate materials: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function scrapeJobDescription(url: string): Promise<string> {
  try {
    const got = await import('got');
    const { parse } = await import('node-html-parser');
    
    const response = await got.default(url, {
      timeout: { request: 10000 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TailoredApply/1.0)'
      }
    });

    const root = parse(response.body);
    
    // Common selectors for job description content
    const selectors = [
      '.job-description',
      '.job-details',
      '.description',
      '[data-automation-id="jobPostingDescription"]',
      '.jobsearch-jobDescriptionText',
      '.job-content',
      '.posting-content'
    ];

    let content = '';
    for (const selector of selectors) {
      const element = root.querySelector(selector);
      if (element) {
        content = element.text;
        break;
      }
    }

    // Fallback: get main content
    if (!content) {
      const main = root.querySelector('main') || root.querySelector('body');
      content = main?.text || '';
    }

    // Clean and limit content
    content = content
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000); // Limit to prevent token overflow

    return content || 'Unable to extract job description content';
  } catch (error) {
    console.error('Job description scraping error:', error);
    return 'Unable to scrape job description';
  }
}
