import type { ITool, ToolCategory, ToolPermission, ToolValidationResult } from './ITool';
import type { ICityServiceProvider } from '../cityServices/ICityServiceProvider';
import type { IMobilityService } from '../mobility/IMobilityService';
import type { IEmergencyService } from '../emergency/IEmergencyService';

import { RegisterComplaintTool } from './RegisterComplaintTool';
import { GetComplaintStatusTool } from './GetComplaintStatusTool';
import { GetCitizenRequestsTool } from './GetCitizenRequestsTool';

import { SearchRoutesTool } from './SearchRoutesTool';
import { FindNearbyStopsTool } from './FindNearbyStopsTool';
import { GetBusStatusTool } from './GetBusStatusTool';
import { GetETATool } from './GetETATool';

import { FindNearbyHospitalTool } from './FindNearbyHospitalTool';
import { FindNearbyPoliceStationTool } from './FindNearbyPoliceStationTool';
import { FindNearbyFireStationTool } from './FindNearbyFireStationTool';

import { GetRequestByIdTool } from './GetRequestByIdTool';
import { GetRequestHistoryTool } from './GetRequestHistoryTool';
import { GetOpenRequestsTool } from './GetOpenRequestsTool';

import { type Result, failureResult, ToolExecutionError, ValidationFailedError } from '../../lib/error';

export interface RegisteredToolMetadata {
  name: string;
  description: string;
  category: ToolCategory;
  permission: ToolPermission;
  requiresConfirmation: boolean;
  parametersSchema: any;
}

export class ToolRegistry {
  private tools: Map<string, ITool> = new Map();

  constructor(
    cityService: ICityServiceProvider,
    mobilityService: IMobilityService,
    emergencyService: IEmergencyService
  ) {
    // CIVIC Tools
    this.registerTool(new RegisterComplaintTool(cityService));
    this.registerTool(new GetComplaintStatusTool(cityService));
    this.registerTool(new GetCitizenRequestsTool(cityService));

    // MOBILITY Tools
    this.registerTool(new SearchRoutesTool(mobilityService));
    this.registerTool(new FindNearbyStopsTool(mobilityService));
    this.registerTool(new GetBusStatusTool(mobilityService));
    this.registerTool(new GetETATool(mobilityService));

    // EMERGENCY Tools
    this.registerTool(new FindNearbyHospitalTool(emergencyService));
    this.registerTool(new FindNearbyPoliceStationTool(emergencyService));
    this.registerTool(new FindNearbyFireStationTool(emergencyService));

    // TRACKING Tools
    this.registerTool(new GetRequestByIdTool(cityService));
    this.registerTool(new GetRequestHistoryTool(cityService));
    this.registerTool(new GetOpenRequestsTool(cityService));
  }

  public registerTool(tool: ITool) {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): ITool | undefined {
    return this.tools.get(name);
  }

  public listTools(category?: ToolCategory): RegisteredToolMetadata[] {
    const list = Array.from(this.tools.values());
    const filtered = category ? list.filter((t) => t.category === category) : list;
    return filtered.map((t) => ({
      name: t.name,
      description: t.description,
      category: t.category,
      permission: t.permission,
      requiresConfirmation: t.requiresConfirmation,
      parametersSchema: t.parametersSchema
    }));
  }

  public validateInput(toolName: string, params: any): ToolValidationResult {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return { isValid: false, missingParameters: [], error: `Tool '${toolName}' not found` };
    }
    return tool.validate(params);
  }

  public async executeTool(
    name: string,
    params: any,
    confirmationGiven = false
  ): Promise<Result<any>> {
    const tool = this.tools.get(name);
    if (!tool) {
      return failureResult(new ToolExecutionError(name, `Tool '${name}' is not registered`));
    }

    // Confirmation Policy Check for ACTION tools
    if (tool.permission === 'ACTION' && tool.requiresConfirmation && !confirmationGiven) {
      return failureResult(
        new ValidationFailedError(
          name,
          `Action tool '${name}' requires explicit citizen confirmation before execution.`
        )
      );
    }

    // Schema validation
    const validation = tool.validate(params);
    if (!validation.isValid) {
      return failureResult(
        new ValidationFailedError(name, validation.error || `Invalid input parameters for ${name}`)
      );
    }

    try {
      return await tool.execute(params);
    } catch (err: any) {
      return failureResult(new ToolExecutionError(name, err.message || 'Tool execution error', err));
    }
  }
}
