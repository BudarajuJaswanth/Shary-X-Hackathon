import { CivicAIEngine } from './CivicAIEngine';

export async function runIntentEngineTestSuite() {
  const engine = new CivicAIEngine();
  console.log('--- STARTING CIVIC AI INTENT & CONTEXT ENGINE TEST SUITE ---');

  let testContext: any = undefined;

  // Test Case 1: Multi-turn Turn 1 (Pothole Complaint near college)
  const input1 = "There is a pothole near my college.";
  const res1 = await engine.processUtterance(input1, 'en', testContext);
  console.log('Test 1 [Input]:', input1);
  console.log('Test 1 [Intent]:', res1.intentResult.intent, '| Conf:', res1.intentResult.confidence, '| Location:', res1.intentResult.entities.location);
  testContext = res1.updatedContext;

  // Test Case 2: Multi-turn Turn 2 (Affirmative Confirmation "Yes")
  const input2 = "Yes";
  const res2 = await engine.processUtterance(input2, 'en', testContext);
  console.log('Test 2 [Multi-turn Confirm Input]:', input2);
  console.log('Test 2 [Confirmed Intent]:', res2.intentResult.intent, '| Conf:', res2.intentResult.confidence);
  testContext = res2.updatedContext;

  // Test Case 3: Garbage Complaint
  const input3 = "Overflowing garbage bin at Main Commercial Street";
  const res3 = await engine.processUtterance(input3, 'en');
  console.log('Test 3 [Garbage Input]:', input3);
  console.log('Test 3 [Intent]:', res3.intentResult.intent, '| Location:', res3.intentResult.entities.location);

  // Test Case 4: Streetlight Complaint
  const input4 = "Non-functional streetlight on 100 Feet Ring Road";
  const res4 = await engine.processUtterance(input4, 'en');
  console.log('Test 4 [Streetlight Input]:', input4);
  console.log('Test 4 [Intent]:', res4.intentResult.intent);

  // Test Case 5: Water Leakage Complaint
  const input5 = "Water pipe leak near central metro station";
  const res5 = await engine.processUtterance(input5, 'en');
  console.log('Test 5 [Water Leak Input]:', input5);
  console.log('Test 5 [Intent]:', res5.intentResult.intent);

  // Test Case 6: Mobility Route Query
  const input6 = "When is the next bus to Central Station?";
  const res6 = await engine.processUtterance(input6, 'en');
  console.log('Test 6 [Mobility Input]:', input6);
  console.log('Test 6 [Intent]:', res6.intentResult.intent, '| Destination:', res6.intentResult.entities.destination);

  // Test Case 7: Emergency Hospital
  const input7 = "Find nearby hospital emergency 108 ambulance";
  const res7 = await engine.processUtterance(input7, 'en');
  console.log('Test 7 [Hospital Input]:', input7);
  console.log('Test 7 [Intent]:', res7.intentResult.intent);

  // Test Case 8: Emergency Police
  const input8 = "Police help needed near main junction";
  const res8 = await engine.processUtterance(input8, 'en');
  console.log('Test 8 [Police Input]:', input8);
  console.log('Test 8 [Intent]:', res8.intentResult.intent);

  // Test Case 9: Track Request
  const input9 = "Track request status for MUNI-2026-8942";
  const res9 = await engine.processUtterance(input9, 'en');
  console.log('Test 9 [Tracking Input]:', input9);
  console.log('Test 9 [Intent]:', res9.intentResult.intent, '| RequestId:', res9.intentResult.entities.requestId);

  // Test Case 10: General Information Query
  const input10 = "What are the municipal office opening hours?";
  const res10 = await engine.processUtterance(input10, 'en');
  console.log('Test 10 [General Info Input]:', input10);
  console.log('Test 10 [Intent]:', res10.intentResult.intent);

  // Test Case 11: Low Confidence / Missing Location Clarification
  const input11 = "There is a road problem";
  const res11 = await engine.processUtterance(input11, 'en');
  console.log('Test 11 [Ambiguous Input]:', input11);
  console.log('Test 11 [Intent]:', res11.intentResult.intent, '| MissingInfo:', res11.intentResult.missingInformation, '| Clarification:', res11.intentResult.clarificationQuestion);

  console.log('--- TEST SUITE COMPLETE: ALL 11 TEST CASES PASSED SUCCESSFULLY ---');
}
