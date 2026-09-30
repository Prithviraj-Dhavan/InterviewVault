export function buildProfilePrompt(resumeText: string, jdText: string) {
  return `Job Description:
${jdText}

Candidate's Resume:
${resumeText}

Analyze this resume against the job description and output a candidate profile.`;
}

export function buildPlanPrompt(profile: any, jdText: string, resumeText: string, company: string, role: string) {
  return `Company: ${company}
Role: ${role}

Job Description:
${jdText}

Candidate's Resume:
${resumeText}

Candidate Profile Summary:
${JSON.stringify(profile, null, 2)}

Create an interview plan with weighted topics to cover in the interview for the ${role} role at ${company}. 

IMPORTANT INSTRUCTIONS:
1. Smartly analyze the WHOLE resume. Identify different projects, internships, and core skills.
2. Equally and intelligently distribute the topics/questions across these different projects and skills. DO NOT focus on just one project.
3. Keep the total 'question_count' across all topics to exactly 5. This allows room for follow-ups (hard limit of 7 questions total).
4. Tailor the topics and weights to the known interview style of ${company} and the specific requirements of the JD.`;
}

export function buildQuestionPrompt(
  plan: any,
  profile: any,
  jdText: string,
  resumeText: string,
  transcript: string,
  isFollowUp: boolean,
  company: string,
  role: string
) {
  return `Company: ${company}
Role: ${role}

Job Description:
${jdText}

Candidate's Resume:
${resumeText}

Candidate Profile Summary:
${JSON.stringify(profile, null, 2)}

Interview Plan:
${JSON.stringify(plan, null, 2)}

Interview Transcript so far:
${transcript || "(No questions asked yet)"}

Task: ${
    isFollowUp
      ? `The candidate just answered a question. Their score was low. Ask exactly ONE concise follow-up question to probe their weak area in that last answer. Keep it conversational. Do NOT ask multiple questions at once.`
      : `Based on the Interview Plan, ask ONE single, highly-focused interview question for a ${role} at ${company}. 
      
RULES:
1. Heavily tailor the question to the candidate's Resume (e.g., frame system design or behavioral questions around their specific past projects, internships, or skills).
2. Emulate the typical interview style, difficulty, and tone of ${company}.
3. ASK EXACTLY ONE QUESTION. Do NOT ask multi-part questions (e.g. "How would you do X? And what about Y? And how would you handle Z?"). Pick ONE specific aspect to focus on. Keep it conversational and concise, like a real human interviewer.
4. Do NOT just ask generic JD questions.`
  }`;
}

export function buildEvaluationPrompt(
  question: string,
  answer: string,
  jdText: string
) {
  return `Job Description:
${jdText}

Question Asked:
${question}

Candidate's Answer:
${answer}

Evaluate this answer on a scale of 1 to 5. Identify strengths and gaps. Set triggeredFollowup to true if the score is < 4 and you recommend probing further.`;
}

export function buildReportPrompt(
  profile: any,
  transcript: string,
  jdText: string
) {
  return `Job Description:
${jdText}

Candidate Profile:
${JSON.stringify(profile, null, 2)}

Full Transcript and Evaluations:
${transcript}

Write a comprehensive narrative summary evaluating the candidate's performance across the interview. Do NOT invent numeric scores.`;
}
