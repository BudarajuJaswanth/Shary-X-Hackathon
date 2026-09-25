import type { Route, TransitStop, TransitVehicle, ETA } from '../../domain/models';

export interface IMobilityService {
  name: string;
  isMock: boolean;

  getRoutes(origin?: string, destination?: string): Promise<Route[]>;
  getNearbyStops(locationOrArea?: string): Promise<TransitStop[]>;
  getBusStatus(routeNumber?: string, destination?: string): Promise<TransitVehicle[]>;
  getETA(routeIdOrNumber: string, origin?: string, destination?: string): Promise<ETA | null>;
}
