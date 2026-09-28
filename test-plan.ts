import { generatePlan } from './src/lib/interview/services';

async function test() {
  try {
    const result = await generatePlan('f650bcad-4b57-4f91-b6b5-cf9edd6f27eb');
    console.log("SUCCESS:", result);
  } catch (err) {
    console.error("FAILED:", err);
  }
}

test();
