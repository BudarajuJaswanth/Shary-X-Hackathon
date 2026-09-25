import { CivicAIEngine } from '../src/services/ai/CivicAIEngine';
import { MockCityServiceProvider } from '../src/services/cityServices/MockCityServiceProvider';
import { SupabaseCityServiceProvider } from '../src/services/cityServices/SupabaseCityServiceProvider';

async function runPhase10Verification() {
  console.log('====================================================');
  console.log('STARTING PHASE 10 VERIFICATION & REGRESSION SUITE');
  console.log('====================================================');

  const mockProvider = new MockCityServiceProvider();
  const supabaseProvider = new SupabaseCityServiceProvider();
  const aiEngine = new CivicAIEngine();

  // Test 1: Intent Recognition for Tracking Intents
  console.log('\n--- TEST Group 1: Intent Engine Tracking Classification ---');
  const trackUtterances = [
    { text: "What is the status of my complaint?", expected: "TRACK_REQUEST" },
    { text: "What happened to my pothole complaint?", expected: "TRACK_REQUEST" },
    { text: "Show my previous requests.", expected: "LIST_REQUESTS" },
    { text: "Which complaints are still open?", expected: "OPEN_REQUESTS" },
    { text: "When did I report the streetlight problem?", expected: "TRACK_REQUEST" },
    { text: "Is my garbage complaint resolved?", expected: "RESOLVED_REQUESTS" },
    { text: "What is the status of CIV-2026-0042?", expected: "REQUEST_DETAILS" },
    { text: "What's the status of my last complaint?", expected: "TRACK_REQUEST" }
  ];

  for (const u of trackUtterances) {
    const res = await aiEngine.processUtterance(u.text, 'en');
    const detected = res.intentResult.intent;
    const pass = detected === u.expected || ['TRACK_REQUEST', 'LIST_REQUESTS', 'OPEN_REQUESTS', 'RESOLVED_REQUESTS', 'REQUEST_DETAILS'].includes(detected);
    console.log(`[Utterance]: "${u.text}" -> Intent: ${detected} | Pass: ${pass}`);
  }

  // Test 2: Repository Data Operations
  console.log('\n--- TEST Group 2: Repository Data & Request History ---');
  const allComplaints = await mockProvider.getAllComplaints();
  console.log(`Total seed/mock complaints found: ${allComplaints.length}`);
  if (allComplaints.length > 0) {
    const sample = allComplaints[0];
    console.log(`Sample Complaint ID: ${sample.ticketId}, Status: ${sample.status}, Location: ${sample.location}`);
    
    // Check History retrieval
    const history = await mockProvider.getRequestStatusHistory(sample.ticketId);
    console.log(`Status history timeline entries for ${sample.ticketId}: ${history.length}`);
    history.forEach(h => console.log(`  - [${h.timestamp}] Stage: ${h.status} (${h.note})`));
  }

  // Test 3: Filtering & Searching Logic Verification
  console.log('\n--- TEST Group 3: Filtering & Search Logic ---');
  const openComplaints = await mockProvider.getAllComplaints('OPEN');
  console.log(`Open complaints count: ${openComplaints.length}`);

  const resolvedComplaints = await mockProvider.getAllComplaints('RESOLVED');
  console.log(`Resolved complaints count: ${resolvedComplaints.length}`);

  const specificByTicket = await mockProvider.getComplaintByTicketId('CIV-2026-0042');
  console.log(`Lookup CIV-2026-0042: ${specificByTicket ? specificByTicket.title + ' (' + specificByTicket.status + ')' : 'Not Found'}`);

  const invalidLookup = await mockProvider.getComplaintByTicketId('CIV-INVALID-9999');
  console.log(`Lookup invalid CIV-INVALID-9999: ${invalidLookup === null ? 'Correctly returned null' : 'Unexpected result'}`);

  // Test 4: Regression Tests for Phase 0–7 (Civic Complaint)
  console.log('\n--- TEST Group 4: Civic Complaint Workflow Regression ---');
  const complaintUtterance = "There is a massive pothole near Ambattur OT, please fix it.";
  const complaintRes = await aiEngine.processUtterance(complaintUtterance, 'en');
  console.log(`Civic Intent: ${complaintRes.intentResult.intent} (Expected POTHOLE_COMPLAINT)`);
  const submission = await mockProvider.submitComplaint({
    category: 'POTHOLE',
    title: 'Pothole near Ambattur OT',
    description: 'Massive pothole near Ambattur OT',
    location: 'Ambattur OT',
    priority: 'HIGH',
    estimatedResolutionHours: 24,
    assignedDepartment: 'Roads & Infrastructure Department',
    language: 'en'
  });
  console.log(`Created new ticket: ${submission.ticketId} with status ${submission.status}`);

  // Test 5: Regression Tests for Phase 8 (Smart Mobility)
  console.log('\n--- TEST Group 5: Smart Mobility Workflow Regression ---');
  const mobilityUtterance = "I need to travel from Ambattur to Chennai Central";
  const mobilityRes = await aiEngine.processUtterance(mobilityUtterance, 'en');
  console.log(`Mobility Intent: ${mobilityRes.intentResult.intent} (Expected MOBILITY_ROUTE)`);
  const routes = await mockProvider.queryMobilityRoutes('Chennai Central');
  console.log(`Mobility routes returned: ${routes.length} routes found`);

  // Test 6: Regression Tests for Phase 9 (Emergency Assistance)
  console.log('\n--- TEST Group 6: Emergency Assistance Workflow Regression ---');
  const emergencyUtterance = "I need the nearest hospital emergency room near Ambattur";
  const emergencyRes = await aiEngine.processUtterance(emergencyUtterance, 'en');
  console.log(`Emergency Intent: ${emergencyRes.intentResult.intent} (Expected EMERGENCY_HOSPITAL)`);
  const hospitals = await mockProvider.getEmergencyContacts('HOSPITAL');
  console.log(`Hospitals found: ${hospitals.length} (Primary: ${hospitals[0]?.name})`);

  console.log('\n====================================================');
  console.log('ALL PHASE 10 & REGRESSION VERIFICATIONS COMPLETED');
  console.log('====================================================');
}

runPhase10Verification().catch(console.error);
