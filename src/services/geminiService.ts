import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PdfDocument {
  name: string;
  mimeType: string;
  data: string; // base64
}

export async function generateSynthesisMap(
  goal: string,
  pdfs: PdfDocument[]
): Promise<string> {
  const parts: any[] = pdfs.map((pdf) => ({
    inlineData: {
      mimeType: pdf.mimeType,
      data: pdf.data,
    },
  }));

  parts.push({
    text: `You are THE VIBE-RESEARCH ENGINE, a specialized Research Operating System designed to turn raw academic literature into high-level intuitive insights and validated experiment designs.

The user has provided the following Research Goal:
"${goal}"

They have also uploaded foundational PDFs (treat these as the ground truth / "Source Code" of the problem).

PHASE 1: THE SYNTHESIS MAP
Extract the "Vibe". Do not provide a generic summary.

Output must include exactly these sections:
## 1. The Core Tension
Identify the one specific technical bottleneck or conceptual gap shared by these papers.

## 2. The "Non-Obvious" Insights
List 3-5 insights that are only visible when looking at all papers simultaneously.

## 3. High-Density Reading List
Point the researcher to specific pages/figures across the papers that are "Must-Reads" for their specific goal.

## 4. Literature Review
Use your search tool to execute a comprehensive literature review. Structure your output by doing the following:

Contextualize: Find papers that bridge the user's core problem with the specific focus of their uploaded paper.

Recommend: Provide a curated list of highly relevant, up-to-date literature, including brief summaries of why each is applicable.

Identify Gaps: Critically analyze the user's current approach and highlight any significant results, recent advancements, or conflicting studies they may have ignored or missed.
STYLE CONSTRAINTS:
- Use $LaTeX$ for all mathematical variables, formulas, and proofs. Use single $ for inline math and double $$ for block math.
- Keep responses modular and scannable using Markdown headers.`,
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return response.text || "";
}

export async function generateBrainstormingCanvas(
  goal: string,
  pdfs: PdfDocument[],
  synthesisMap: string,
  idea: string
): Promise<string> {
  const parts: any[] = pdfs.map((pdf) => ({
    inlineData: {
      mimeType: pdf.mimeType,
      data: pdf.data,
    },
  }));

  parts.push({
    text: `You are THE VIBE-RESEARCH ENGINE.

Research Goal: "${goal}"

Synthesis Map:
${synthesisMap}

The user has proposed the following idea:
"${idea}"

PHASE 2: THE BRAINSTORMING CANVAS
Act as a "Bouncing Board" for high-level intuition.

Output must include exactly these sections:
## 1. Vibe Check
Compare the user's idea against the uploaded literature. Does it conflict with a known proof? Does it build on a known strength? Also check if this idea is already present in the literature. If the idea is weak, challenge it intellectually but constructively.

## 2. Lateral Expansion
Suggest 2-3 "What if?" scenarios that push the idea further.

## 3. Technical Formalization
Convert the user's "vibe" into formal notation or LaTeX equations to ensure scientific rigor.

STYLE CONSTRAINTS:
- Use $LaTeX$ for all mathematical variables, formulas, and proofs. Use single $ for inline math and double $$ for block math.
- Keep responses modular and scannable using Markdown headers.`,
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
  });

  return response.text || "";
}

export async function generateExperimentFactory(
  goal: string,
  pdfs: PdfDocument[],
  synthesisMap: string,
  mergedSynthesis: string
): Promise<string> {
  const parts: any[] = pdfs.map((pdf) => ({
    inlineData: {
      mimeType: pdf.mimeType,
      data: pdf.data,
    },
  }));

  parts.push({
    text: `You are THE VIBE-RESEARCH ENGINE.

Research Goal: "${goal}"

Synthesis Map:
${synthesisMap}

Merged Research Synthesis:
${mergedSynthesis}

The user has asked to validate the proposed unified framework.

PHASE 3: THE EXPERIMENT FACTORY
Generate a "Minimum Viable Experiment" (MVE) to validate the core contribution of the Merged Research Synthesis.

Output must include exactly these sections:
## 1. The Hypothesis
A clear, testable statement in LaTeX derived from the merged synthesis.

## 2. The Protocol
A step-by-step textual guide on how to run a small-scale validation (e.g., a specific code simulation, a proof structure, or a chemical control group).

## 3. Failure Modes
Explicitly state what a "Fail" looks like so the researcher can pivot quickly.

STYLE CONSTRAINTS:
- Use $LaTeX$ for all mathematical variables, formulas, and proofs. Use single $ for inline math and double $$ for block math.
- Keep responses modular and scannable using Markdown headers.`,
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
  });

  return response.text || "";
}

export async function generateFormalProof(
  goal: string,
  pdfs: PdfDocument[],
  mergedSynthesis: string
): Promise<string> {
  const parts: any[] = pdfs.map((pdf) => ({
    inlineData: {
      mimeType: pdf.mimeType,
      data: pdf.data,
    },
  }));

  parts.push({
    text: `You are THE VIBE-RESEARCH ENGINE's Formal Verification Module.

Research Goal: "${goal}"

Proposed Merged Synthesis (The Theorem/Model to prove):
${mergedSynthesis}

PHASE 3: FORMAL PROOF & VERIFICATION
Your task is to mathematically verify the core theorem or model proposed in the Merged Synthesis.

STEPS:
1. Extract Core Lemmas: Identify 2-3 critical lemmas or axioms from the uploaded foundational papers that are necessary for this proof.
2. The Proof Construction: Attempt a step-by-step formal proof of the proposed unified model/theorem.
3. Verification Check: 
   - If the proof holds: Provide the full derivation.
   - If the proof DOES NOT hold: Identify the specific logical gap or contradiction. Provide a concrete counter-example (mathematical or algorithmic).

STYLE CONSTRAINTS:
- Use $LaTeX$ for all mathematical variables, formulas, and proofs. Use single $ for inline math and double $$ for block math.
- Use academic notation.
- If providing a counter-example, make it rigorous.`,
  });

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts },
  });

  return response.text || "";
}

export async function generatePaperDiagram(pdf: PdfDocument): Promise<string> {
  const parts: any[] = [
    {
      inlineData: {
        mimeType: pdf.mimeType,
        data: pdf.data,
      },
    },
    {
      text: `You are a technical diagram expert. Analyze the provided PDF paper and generate a Mermaid.js diagram that represents:
1. The Core Idea (The central thesis or problem being solved).
2. Proof Techniques (The methodology, mathematical approaches, or experimental setups used).
3. Structure (The logical flow of the paper's arguments).

Use a flowchart (graph TD) or a sequence diagram if more appropriate. 

CRITICAL SYNTAX RULES:
- Do NOT use pipe characters (|) inside node labels. Use "norm" or "abs" instead of double bars.
- Wrap all node labels in double quotes if they contain any special characters (e.g., Node["Label with (parentheses)"]).
- Ensure the Mermaid code is valid and strictly follows Mermaid.js syntax.

Output ONLY the raw Mermaid code block, starting with \`\`\`mermaid and ending with \`\`\`. Do not include any other text.`,
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
  });

  // Extract mermaid code from the response
  const text = response.text || "";
  const match = text.match(/```mermaid\n([\s\S]*?)\n```/);
  return match ? match[1].trim() : text.replace(/```mermaid|```/g, "").trim();
}

export async function generateMergedSynthesis(
  goal: string,
  pdfs: PdfDocument[],
  synthesisMap: string
): Promise<string> {
  const parts: any[] = pdfs.map((pdf) => ({
    inlineData: {
      mimeType: pdf.mimeType,
      data: pdf.data,
    },
  }));

  parts.push({
    text: `You are THE VIBE-RESEARCH ENGINE. Your task is to synthesize these foundational papers into a single, cohesive "Merged Research Paper" that addresses the user's Research Goal.

Research Goal: "${goal}"

Synthesis Map:
${synthesisMap}

This new document should:
1. Identify the intersection of the core ideas from all provided papers.
2. Propose a new, unified model, theorem, or algorithm that combines the strengths of all papers to solve the Research Goal.
3. Define new keywords that describe this hybrid field.
4. Include formal proofs or algorithmic steps where appropriate.

STRUCTURE:
- Title (A creative, high-level title for the merged research)
- Abstract (Synthesized summary)
- 1. The Unified Framework (How the papers connect)
- 2. Proposed [Model/Algorithm/Theorem] (The core new contribution)
- 3. Formalization (Detailed LaTeX formulas and properly formatted pseudocode algorithms)
- 4. Future Directions

STYLE CONSTRAINTS:
- Use $LaTeX$ for all mathematical variables, formulas, and proofs. Use single $ for inline math and double $$ for block math.
- Use properly formatted Markdown code blocks for algorithms (e.g., \`\`\`python or \`\`\`pseudocode).
- Maintain a high academic standard.`,
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
  });

  return response.text || "";
}

export async function generateSimulation(
  goal: string,
  mergedSynthesis: string,
  datasetInfo: string = "huggingface/time-series-datasets"
): Promise<string> {
  const parts: any[] = [
    {
      text: `You are THE VIBE-RESEARCH ENGINE's Simulation Architect.
      
Research Goal: "${goal}"

Merged Research Synthesis (The Theory):
${mergedSynthesis}

Target Dataset Context: "${datasetInfo}"

PHASE 4: SIMULATION & VALIDATION
Your task is to write a Python simulation (using libraries like pandas, numpy, scikit-learn, or statsmodels) that illustrates the core findings of the Merged Research Synthesis using a representative time-series dataset from Hugging Face.

STEPS:
1. Data Loading Strategy: Describe how to load a relevant time-series dataset from Hugging Face (e.g., using the 'datasets' library).
2. Simulation Code: Write a complete, well-commented Python script that:
   - Preprocesses the data.
   - Implements the core logic of the proposed theory/model.
   - Visualizes the results (using matplotlib or seaborn).
3. Theoretical Alignment: Provide a detailed commentary on whether the expected simulation results would support or contradict the proposed theory. Explain the "Why" behind the alignment.

STYLE CONSTRAINTS:
- Use $LaTeX$ for all mathematical variables and formulas.
- Provide the Python code in a clear Markdown code block.
- Ensure the commentary is rigorous and references specific parts of the theory.`,
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts },
  });

  return response.text || "";
}
