import type { EmergencyFacility, EmergencyFacilityType } from '../../domain/models';

export interface IEmergencyService {
  name: string;
  isMock: boolean;

  findNearbyFacilities(
    type: EmergencyFacilityType,
    areaOrCoords?: string | { lat: number; lng: number }
  ): Promise<EmergencyFacility[]>;

  getFacilityDetails(facilityId: string): Promise<EmergencyFacility | null>;
}
