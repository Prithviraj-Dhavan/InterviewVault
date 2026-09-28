import { generateObject } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';
import { env } from './src/env';

async function test() {
  try {
    const res = await generateObject({
      model: groq('openai/gpt-oss-20b'),
      schema: z.object({ msg: z.string() }),
      prompt: 'say hello',
    });
    console.log(res.object);
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test();
