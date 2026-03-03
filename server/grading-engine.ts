import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface GradingResult {
  status: "passed" | "failed";
  score: number;
  metrics: {
    sharpe?: number;
    drawdown?: number;
    turnover?: number;
    stability?: number;
  };
  feedback: string;
}

export async function gradeSubmission(
  code: string,
  challengeTitle: string,
  challengeDescription: string,
  difficulty: string,
  points: number,
  starterCode: string
): Promise<GradingResult> {
  const systemPrompt = `You are a senior quantitative finance code reviewer and grading engine. You evaluate Python code submissions for quantitative finance coding challenges.

You MUST respond with ONLY valid JSON matching this exact schema — no markdown, no backticks, no extra text:
{
  "status": "passed" or "failed",
  "correctness_score": 0-100,
  "code_quality_score": 0-100,
  "efficiency_score": 0-100,
  "sharpe": number between -1.0 and 3.5,
  "max_drawdown": number between -50.0 and 0.0,
  "stability": number between 0.0 and 100.0,
  "feedback_lines": ["line1", "line2", ...]
}

GRADING RULES:
1. Evaluate if the code correctly solves the challenge based on the description.
2. If the code is essentially the unmodified starter code (just "pass" or empty), it MUST fail with correctness_score 0.
3. If the code has syntax errors, obvious logical errors, or doesn't implement the required function, it should fail.
4. Code quality considers: proper use of numpy/pandas, vectorization over loops, edge case handling, clean style.
5. Efficiency considers: algorithmic complexity, avoiding unnecessary operations, memory efficiency.
6. "status" should be "passed" if correctness_score >= 60, otherwise "failed".
7. Generate realistic quant metrics proportional to code quality.
8. Provide 3-6 specific, actionable feedback lines. Reference the actual code when giving feedback.
9. Be strict but fair. A perfect solution gets 85-100. A decent solution gets 60-84. A poor attempt gets 20-59.
10. For ${difficulty} difficulty (${points} points), adjust expectations accordingly — Beginner should be lenient, Expert very strict.`;

  const userPrompt = `CHALLENGE: ${challengeTitle}
DIFFICULTY: ${difficulty} (${points} points)

DESCRIPTION:
${challengeDescription}

STARTER CODE:
${starterCode}

SUBMITTED CODE:
${code}

Evaluate this submission and respond with the JSON grading result.`;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const callModel = async (): Promise<any> => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) throw new Error("Empty response from grading model");

    const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  };

  try {
    let parsed: any;
    try {
      parsed = await callModel();
    } catch (firstErr: any) {
      console.warn("Grading first attempt failed, retrying:", firstErr.message);
      parsed = await callModel();
    }

    const correctness = Math.min(100, Math.max(0, Number(parsed.correctness_score) || 0));
    const quality = Math.min(100, Math.max(0, Number(parsed.code_quality_score) || 0));
    const efficiency = Math.min(100, Math.max(0, Number(parsed.efficiency_score) || 0));

    const weightedScore = correctness * 0.5 + quality * 0.3 + efficiency * 0.2;
    const status = parsed.status === "passed" && correctness >= 60 ? "passed" : "failed";
    const finalScore = status === "passed" ? Math.round((weightedScore / 100) * points) : 0;

    const sharpe = Number(parsed.sharpe) || 0;
    const drawdown = Number(parsed.max_drawdown) || 0;
    const stability = Number(parsed.stability) || 0;

    const feedbackLines: string[] = Array.isArray(parsed.feedback_lines)
      ? parsed.feedback_lines
      : ["No detailed feedback available."];

    const feedback = [
      `═══════════════════════════════════════`,
      `  GRADING REPORT: ${challengeTitle}`,
      `═══════════════════════════════════════`,
      ``,
      `Status: ${status === "passed" ? "✓ PASSED" : "✗ FAILED"}`,
      `Score:  ${finalScore} / ${points} pts`,
      ``,
      `── Breakdown ──────────────────────────`,
      `  Correctness:  ${correctness}%`,
      `  Code Quality: ${quality}%`,
      `  Efficiency:   ${efficiency}%`,
      ``,
      `── Quant Metrics ──────────────────────`,
      `  Sharpe Ratio:  ${sharpe.toFixed(2)}`,
      `  Max Drawdown:  ${drawdown.toFixed(2)}%`,
      `  Stability:     ${stability.toFixed(1)}`,
      ``,
      `── Feedback ───────────────────────────`,
      ...feedbackLines.map((line: string) => `  • ${line}`),
      ``,
      `═══════════════════════════════════════`,
    ].join("\n");

    return {
      status,
      score: finalScore,
      metrics: { sharpe, drawdown, stability },
      feedback,
    };
  } catch (err: any) {
    console.error("Grading engine error:", err.message);
    return {
      status: "failed",
      score: 0,
      metrics: {},
      feedback: [
        `═══════════════════════════════════════`,
        `  GRADING ERROR`,
        `═══════════════════════════════════════`,
        ``,
        `  The grading engine encountered an error.`,
        `  Error: ${err.message}`,
        ``,
        `  Please try submitting again.`,
        `═══════════════════════════════════════`,
      ].join("\n"),
    };
  }
}
