import { generateProfile } from './src/lib/interview/services';

async function test() {
  try {
    console.log("Generating profile...");
    const result = await generateProfile('920c3422-8dd6-4b81-9fdc-416dce0210a2');
    console.log("SUCCESS:", result);
  } catch (err) {
    console.error("FAILED:", err);
  }
}

test();
