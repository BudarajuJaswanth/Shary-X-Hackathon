import type { ITool } from './ITool';
import type { ICityServiceProvider } from '../../providers/CityServiceProvider';
import { RegisterComplaintTool } from './RegisterComplaintTool';
import { GetComplaintStatusTool } from './GetComplaintStatusTool';
import { FindNearbyHospitalTool } from './FindNearbyHospitalTool';
import { GetMobilityInformationTool } from './GetMobilityInformationTool';
import { type Result, failureResult, ToolExecutionError } from '../../lib/error';

export class ToolRegistry {
  private tools: Map<string, ITool> = new Map();

  constructor(cityService: ICityServiceProvider) {
    this.registerTool(new RegisterComplaintTool(cityService));
    this.registerTool(new GetComplaintStatusTool(cityService));
    this.registerTool(new FindNearbyHospitalTool(cityService));
    this.registerTool(new GetMobilityInformationTool(cityService));
  }

  public registerTool(tool: ITool) {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): ITool | undefined {
    return this.tools.get(name);
  }

  public listTools(): Array<{ name: string; description: string; parametersSchema: any }> {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
      parametersSchema: t.parametersSchema
    }));
  }

  public async executeTool(name: string, params: any): Promise<Result<any>> {
    const tool = this.tools.get(name);
    if (!tool) {
      return failureResult(new ToolExecutionError(name, `Tool '${name}' is not registered`));
    }

    try {
      return await tool.execute(params);
    } catch (err: any) {
      return failureResult(new ToolExecutionError(name, err.message || 'Execution error', err));
    }
  }
}
