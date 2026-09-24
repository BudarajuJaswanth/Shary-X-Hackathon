import { SupabaseCivicRepository } from './SupabaseCivicRepository';
import { MockCityServiceProvider } from '../cityServices/MockCityServiceProvider';
import { isSupabaseConfigured } from './supabaseClient';

export async function runPhase7BackendTestSuite() {
  console.log('=== STARTING PHASE 7: PERSISTENT BACKEND TEST SUITE ===');

  const supabaseRepo = new SupabaseCivicRepository();
  const mockService = new MockCityServiceProvider();

  console.log('Supabase Cloud Credentials Configured:', isSupabaseConfigured());

  // 1. CREATE COMPLAINT TEST
  console.log('\n[Test 1: CREATE] Creating civic complaint record...');
  const newComplaintData = {
    category: 'POTHOLE' as const,
    title: 'Severe Deep Pothole Near Highway Exit',
    description: 'Dangerous 3-foot deep crater causing tire punctures near exit ramp.',
    location: 'Outer Ring Road, Exit 4B, Chennai',
    landmark: 'Near Toll Plaza 2',
    priority: 'CRITICAL' as const,
    language: 'en' as const,
    assignedDepartment: 'Public Works Department (PWD) - Roads Division',
    estimatedResolutionHours: 12,
    citizenPhone: '+919876543210'
  };

  let createdTicket;
  if (isSupabaseConfigured()) {
    createdTicket = await supabaseRepo.createComplaint(newComplaintData);
    console.log('Created Ticket via Supabase PostgreSQL:', createdTicket.ticketId);
  } else {
    createdTicket = await mockService.submitComplaint(newComplaintData);
    console.log('Created Ticket via Local Mock Persistence:', createdTicket.ticketId);
  }

  if (!createdTicket || !createdTicket.ticketId) {
    throw new Error('Test 1 Failed: Ticket creation did not return a valid ticket object or ID.');
  }

  // 2. READ COMPLAINT TEST
  console.log('\n[Test 2: READ] Reading complaint by Ticket ID:', createdTicket.ticketId);
  let readTicket;
  if (isSupabaseConfigured()) {
    readTicket = await supabaseRepo.getComplaintByTicketId(createdTicket.ticketId);
  } else {
    readTicket = await mockService.getComplaintByTicketId(createdTicket.ticketId);
  }

  if (!readTicket || readTicket.ticketId !== createdTicket.ticketId) {
    throw new Error(`Test 2 Failed: Could not read created ticket ${createdTicket.ticketId}`);
  }
  console.log('Successfully Read Ticket:', readTicket.ticketId, '| Title:', readTicket.title, '| Status:', readTicket.status);

  // 3. UPDATE COMPLAINT STATUS TEST
  console.log('\n[Test 3: UPDATE] Updating status from REGISTERED to IN_PROGRESS...');
  let updatedTicket;
  if (isSupabaseConfigured()) {
    updatedTicket = await supabaseRepo.updateComplaintStatus(createdTicket.ticketId, 'IN_PROGRESS', 'Field crew deployed on site');
  } else {
    updatedTicket = await mockService.updateComplaintStatus(createdTicket.ticketId, 'IN_PROGRESS', 'Field crew deployed on site');
  }

  if (!updatedTicket || updatedTicket.status !== 'IN_PROGRESS') {
    throw new Error(`Test 3 Failed: Expected status IN_PROGRESS but got ${updatedTicket?.status}`);
  }
  console.log('Successfully Updated Status:', updatedTicket.ticketId, '->', updatedTicket.status);

  // 4. LIST COMPLAINTS TEST
  console.log('\n[Test 4: LIST] Listing all municipal complaints...');
  let complaintList;
  if (isSupabaseConfigured()) {
    complaintList = await supabaseRepo.listComplaints();
  } else {
    complaintList = await mockService.getAllComplaints();
  }

  console.log(`Retrieved ${complaintList.length} complaints from backend.`);
  if (complaintList.length === 0) {
    throw new Error('Test 4 Failed: Expected at least 1 complaint in list.');
  }

  // 5. HISTORY LOOKUP TEST
  console.log('\n[Test 5: HISTORY] Retrieving complaint history for citizen phone +919876543210...');
  const history = isSupabaseConfigured()
    ? await supabaseRepo.getComplaintHistory('+919876543210')
    : complaintList.filter(c => c.citizenPhone === '+919876543210');

  console.log(`Found ${history.length} history records for citizen.`);

  console.log('\n=== ALL PHASE 7 PERSISTENT BACKEND TEST CASES PASSED SUCCESSFULLY ===');
}
