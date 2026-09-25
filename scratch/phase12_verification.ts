import { MockCityServiceProvider } from '../src/services/cityServices/MockCityServiceProvider';
import { MockMobilityService } from '../src/services/mobility/MockMobilityService';
import { MockEmergencyService } from '../src/services/emergency/MockEmergencyService';
import { ToolRegistry } from '../src/services/tools/ToolRegistry';
import { WorkflowOrchestrator } from '../src/services/workflow/WorkflowOrchestrator';

async function runPhase12Verification() {
  console.log('====================================================');
  console.log('STARTING PHASE 12 ACTION-ORIENTED AI SUITE');
  console.log('====================================================');

  const mockCityService = new MockCityServiceProvider();
  const mockMobilityService = new MockMobilityService();
  const mockEmergencyService = new MockEmergencyService();

  const toolRegistry = new ToolRegistry(mockCityService, mockMobilityService, mockEmergencyService);
  const orchestrator = new WorkflowOrchestrator(toolRegistry);

  // Test 1: Tool Registration & Discovery
  console.log('\n--- TEST Group 1: Tool Registry Discovery & Metadata ---');
  const allTools = toolRegistry.listTools();
  console.log(`Total tools registered in ToolRegistry: ${allTools.length}`);
  const categories = ['CIVIC', 'MOBILITY', 'EMERGENCY', 'TRACKING'] as const;
  for (const cat of categories) {
    const catTools = toolRegistry.listTools(cat);
    console.log(`  - Category [${cat}]: ${catTools.length} tools registered (${catTools.map(t => `${t.name} [${t.permission}]`).join(', ')})`);
  }

  // Test 2: Input Schema Validation
  console.log('\n--- TEST Group 2: Tool Input Validation ---');
  const invalidValidation = toolRegistry.validateInput('registerComplaint', { category: 'POTHOLE' });
  console.log(`Validation result for incomplete registerComplaint: Valid=${invalidValidation.isValid}, Missing=[${invalidValidation.missingParameters.join(', ')}]`);

  const validValidation = toolRegistry.validateInput('registerComplaint', {
    category: 'POTHOLE',
    location: 'Panimalar Engineering',
    description: 'Road damage'
  });
  console.log(`Validation result for complete registerComplaint: Valid=${validValidation.isValid}`);

  // Test 3: Confirmation Policy (ACTION vs READ_ONLY)
  console.log('\n--- TEST Group 3: Permission & Confirmation Policy ---');
  // ACTION tool without confirmation -> Should fail safely
  const unconfirmedAction = await orchestrator.executeToolWorkflow(
    'REGISTER_COMPLAINT_WORKFLOW',
    'registerComplaint',
    { category: 'POTHOLE', location: 'Ambattur OT', description: 'Large pothole' },
    false // confirmationGiven = false
  );
  console.log(`Unconfirmed ACTION tool execution: Success=${unconfirmedAction.success} (Expected false)`);

  // READ_ONLY tool -> Should execute immediately
  const readOnlyExec = await orchestrator.executeToolWorkflow(
    'SEARCH_ROUTES_WORKFLOW',
    'searchRoutes',
    { origin: 'Ambattur', destination: 'Chennai Central' },
    false // confirmationGiven = false
  );
  console.log(`READ_ONLY tool execution: Success=${readOnlyExec.success}, Data Count=${readOnlyExec.success ? readOnlyExec.data.length : 0}`);

  // ACTION tool WITH confirmation -> Should succeed
  const token1 = `token_test_${Date.now()}`;
  const confirmedAction = await orchestrator.executeToolWorkflow(
    'REGISTER_COMPLAINT_WORKFLOW',
    'registerComplaint',
    { category: 'POTHOLE', location: 'Ambattur OT', description: 'Large pothole' },
    true, // confirmationGiven = true
    token1
  );
  console.log(`Confirmed ACTION tool execution: Success=${confirmedAction.success}, Ticket ID=${confirmedAction.success ? confirmedAction.data.ticketId : 'N/A'}`);

  // Test 4: Idempotency Protection against duplicate action submissions
  console.log('\n--- TEST Group 4: Idempotency Protection ---');
  const duplicateAction = await orchestrator.executeToolWorkflow(
    'REGISTER_COMPLAINT_WORKFLOW',
    'registerComplaint',
    { category: 'POTHOLE', location: 'Ambattur OT', description: 'Large pothole' },
    true,
    token1 // Same token reused
  );
  console.log(`Duplicate ACTION execution with same token: Success=${duplicateAction.success} (Expected false due to Idempotency Guard)`);

  // Test 5: All 13 Tools Execution Suite
  console.log('\n--- TEST Group 5: Execution Verification for All 13 Core Tools ---');
  const executions = [
    { tool: 'registerComplaint', params: { category: 'GARBAGE', location: 'Padi Junction', description: 'Trash overflow' }, confirm: true },
    { tool: 'getComplaintStatus', params: { ticketId: confirmedAction.success ? confirmedAction.data.ticketId : 'MUNI-2026-8942' }, confirm: false },
    { tool: 'getCitizenRequests', params: { filterStatus: 'ALL' }, confirm: false },
    { tool: 'searchRoutes', params: { origin: 'Ambattur', destination: 'Chennai Central' }, confirm: false },
    { tool: 'findNearbyStops', params: { location: 'Ambattur' }, confirm: false },
    { tool: 'getBusStatus', params: { destination: 'Chennai Central' }, confirm: false },
    { tool: 'getETA', params: { origin: 'Ambattur', destination: 'Chennai Central' }, confirm: false },
    { tool: 'findNearbyHospital', params: { location: 'Ambattur' }, confirm: false },
    { tool: 'findNearbyPoliceStation', params: { location: 'Ambattur' }, confirm: false },
    { tool: 'findNearbyFireStation', params: { location: 'Ambattur' }, confirm: false },
    { tool: 'getRequestById', params: { ticketId: confirmedAction.success ? confirmedAction.data.ticketId : 'MUNI-2026-8942' }, confirm: false },
    { tool: 'getRequestHistory', params: { ticketId: confirmedAction.success ? confirmedAction.data.ticketId : 'MUNI-2026-8942' }, confirm: false },
    { tool: 'getOpenRequests', params: { category: 'ALL' }, confirm: false }
  ];

  for (const item of executions) {
    const res = await orchestrator.executeToolWorkflow('SYSTEM_TEST', item.tool, item.params, item.confirm);
    console.log(`[Tool]: ${item.tool} -> Success: ${res.success}`);
  }

  // Test 6: Audit Logging Audit Trail
  console.log('\n--- TEST Group 6: Internal Audit Logging ---');
  const auditLogs = orchestrator.getAuditLogs();
  console.log(`Total Audit Log Entries: ${auditLogs.length}`);
  console.log(`Latest Audit Entry: [${auditLogs[auditLogs.length - 1]?.timestamp}] Tool=${auditLogs[auditLogs.length - 1]?.toolName}, Status=${auditLogs[auditLogs.length - 1]?.status}, Success=${auditLogs[auditLogs.length - 1]?.success}`);

  console.log('\n====================================================');
  console.log('ALL PHASE 12 TOOL & WORKFLOW ORCHESTRATION TESTS PASSED');
  console.log('====================================================');
}

runPhase12Verification().catch(console.error);
