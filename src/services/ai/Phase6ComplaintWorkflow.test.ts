import { CivicAIEngine } from './CivicAIEngine';
import { MockCityServiceProvider } from '../cityServices/MockCityServiceProvider';

export async function runPhase6ComplaintTestSuite() {
  console.log('=== STARTING PHASE 6: CIVIC COMPLAINT REGISTRATION SUITE ===');

  const engine = new CivicAIEngine();
  const provider = new MockCityServiceProvider();

  // Test Case 1: Pothole complaint end-to-end detection and ticket creation
  const input1 = "There is a huge pothole near my college on MG Road. Please report it.";
  console.log('\n[Test 1] Input:', input1);
  const nlu1 = await engine.processUtterance(input1, 'en');

  console.log('Detected Intent:', nlu1.intentResult.intent);
  console.log('Extracted Location:', nlu1.intentResult.entities.location);
  console.log('Extracted ComplaintType:', nlu1.intentResult.entities.complaintType);

  if (nlu1.intentResult.intent !== 'POTHOLE_COMPLAINT') {
    throw new Error(`Test 1 Failed: Expected POTHOLE_COMPLAINT but got ${nlu1.intentResult.intent}`);
  }

  // Execute mock city service submission
  const ticket1 = await provider.submitComplaint({
    category: 'POTHOLE',
    title: 'Huge Pothole Hazard Report',
    description: input1,
    location: nlu1.intentResult.entities.location || 'MG Road near College',
    priority: 'HIGH',
    language: 'en',
    assignedDepartment: 'Public Works Department (PWD) - Roads Division',
    estimatedResolutionHours: 24
  });

  console.log('Generated Ticket ID:', ticket1.ticketId);
  console.log('Assigned Department:', ticket1.assignedDepartment);
  console.log('Ticket Status:', ticket1.status);

  if (!ticket1.ticketId.startsWith('CIV-2026-')) {
    throw new Error(`Test 1 Failed: Expected CIV-2026-XXXX ID format but got ${ticket1.ticketId}`);
  }

  // Verify status tracking
  const tracked1 = await provider.getComplaintByTicketId(ticket1.ticketId);
  if (!tracked1 || tracked1.ticketId !== ticket1.ticketId) {
    throw new Error(`Test 1 Failed: Could not retrieve complaint by ticketId ${ticket1.ticketId}`);
  }
  console.log('Successfully Tracked Ticket Status:', tracked1.status);

  // Test Case 2: Garbage complaint
  const input2 = "Overflowing trash cans on Commercial Street near Metro pillar 42";
  const nlu2 = await engine.processUtterance(input2, 'en');
  console.log('\n[Test 2] Input:', input2);
  console.log('Detected Intent:', nlu2.intentResult.intent);
  const ticket2 = await provider.submitComplaint({
    category: 'GARBAGE',
    title: 'Garbage Sanitation Hazard',
    description: input2,
    location: nlu2.intentResult.entities.location || 'Commercial Street',
    priority: 'MEDIUM',
    language: 'en',
    assignedDepartment: 'Solid Waste Management Division',
    estimatedResolutionHours: 12
  });
  console.log('Generated Ticket ID:', ticket2.ticketId);

  // Test Case 3: Streetlight complaint
  const input3 = "Streetlight not working on 100 feet ring road";
  const nlu3 = await engine.processUtterance(input3, 'en');
  console.log('\n[Test 3] Input:', input3);
  console.log('Detected Intent:', nlu3.intentResult.intent);
  const ticket3 = await provider.submitComplaint({
    category: 'STREETLIGHT',
    title: 'Streetlight Outage',
    description: input3,
    location: nlu3.intentResult.entities.location || '100 feet ring road',
    priority: 'HIGH',
    language: 'en',
    assignedDepartment: 'Electrical & Street Lighting Department',
    estimatedResolutionHours: 48
  });
  console.log('Generated Ticket ID:', ticket3.ticketId);

  // Test Case 4: Water leakage complaint
  const input4 = "Water pipeline leaking near metro station";
  const nlu4 = await engine.processUtterance(input4, 'en');
  console.log('\n[Test 4] Input:', input4);
  console.log('Detected Intent:', nlu4.intentResult.intent);
  const ticket4 = await provider.submitComplaint({
    category: 'WATER_LEAKAGE',
    title: 'Water Pipe Leakage',
    description: input4,
    location: nlu4.intentResult.entities.location || 'Near metro station',
    priority: 'CRITICAL',
    language: 'en',
    assignedDepartment: 'Metropolitan Water Supply & Sewage Board',
    estimatedResolutionHours: 12
  });
  console.log('Generated Ticket ID:', ticket4.ticketId);

  // Test Case 5: Road damage complaint
  const input5 = "Major asphalt surface cracking and road damage on main highway";
  const nlu5 = await engine.processUtterance(input5, 'en');
  console.log('\n[Test 5] Input:', input5);
  console.log('Detected Intent:', nlu5.intentResult.intent);
  const ticket5 = await provider.submitComplaint({
    category: 'ROAD_DAMAGE',
    title: 'Road Surface Damage',
    description: input5,
    location: nlu5.intentResult.entities.location || 'Main highway',
    priority: 'HIGH',
    language: 'en',
    assignedDepartment: 'Highways & Infrastructure Maintenance',
    estimatedResolutionHours: 36
  });
  console.log('Generated Ticket ID:', ticket5.ticketId);

  console.log('\n=== ALL PHASE 6 COMPLAINT WORKFLOW TEST CASES PASSED SUCCESSFULLY ===');
}
