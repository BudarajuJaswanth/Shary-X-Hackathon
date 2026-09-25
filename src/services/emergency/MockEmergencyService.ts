import type { IEmergencyService } from './IEmergencyService';
import type { EmergencyFacility, EmergencyFacilityType } from '../../domain/models';

export class MockEmergencyService implements IEmergencyService {
  public name = 'Mock Emergency Services Directory';
  public isMock = true;

  private mockFacilities: EmergencyFacility[] = [
    // HOSPITALS
    {
      id: 'hosp_amb_1',
      name: 'Ambattur CityCare Multi-Speciality Hospital',
      type: 'HOSPITAL',
      address: 'Plot 12, MTH Road, Ambattur OT, Chennai - 600053',
      cityArea: 'Ambattur',
      latitude: 13.1143,
      longitude: 80.1548,
      distanceKm: 1.2,
      phone: '+91 44 2658 9000',
      available24x7: true,
      services: ['24x7 Emergency Dept', 'Trauma Care', 'ICU', 'Ambulance Service', 'Blood Bank'],
      isDemoData: true
    },
    {
      id: 'hosp_cnt_1',
      name: 'Rajiv Gandhi Government General Hospital & Emergency Care',
      type: 'HOSPITAL',
      address: 'EVR Periyar Salai, Park Town, Near Chennai Central, Chennai - 600003',
      cityArea: 'Chennai Central',
      latitude: 13.0827,
      longitude: 80.2707,
      distanceKm: 0.8,
      phone: '+91 44 2530 5000',
      available24x7: true,
      services: ['24x7 Level-1 Trauma Center', 'Cardiac Emergency', 'Burn Unit', 'Dialysis', 'Ambulance Hub'],
      isDemoData: true
    },
    {
      id: 'hosp_ann_1',
      name: 'Sundaram Medical Foundation Emergency Center',
      type: 'HOSPITAL',
      address: '4th Avenue, Shanthi Colony, Anna Nagar, Chennai - 600040',
      cityArea: 'Anna Nagar',
      latitude: 13.0878,
      longitude: 80.2091,
      distanceKm: 2.1,
      phone: '+91 44 2626 8844',
      available24x7: true,
      services: ['Emergency Care', 'Pediatric ICU', 'Stroke Unit', 'Orthopedic Trauma'],
      isDemoData: true
    },
    {
      id: 'hosp_gui_1',
      name: 'Guindy Apex Emergency Clinic & Trauma Center',
      type: 'HOSPITAL',
      address: 'GST Road, Opposite Metro Station, Guindy, Chennai - 600032',
      cityArea: 'Guindy',
      latitude: 13.0067,
      longitude: 80.202,
      distanceKm: 1.5,
      phone: '+91 44 2235 1100',
      available24x7: true,
      services: ['24x7 Emergency', 'Cardiology', 'Critical Care Response'],
      isDemoData: true
    },

    // POLICE STATIONS
    {
      id: 'pol_amb_1',
      name: 'T1 Ambattur Police Station',
      type: 'POLICE',
      address: 'CTH Road, Near Canara Bank, Ambattur, Chennai - 600053',
      cityArea: 'Ambattur',
      latitude: 13.115,
      longitude: 80.156,
      distanceKm: 0.9,
      phone: '+91 44 2658 0100',
      available24x7: true,
      services: ['24x7 Crime Control Room', 'Law & Order Patrol', 'Traffic Control Desk', 'Women Help Desk'],
      isDemoData: true
    },
    {
      id: 'pol_cnt_1',
      name: 'B1 North Town Central Police Station',
      type: 'POLICE',
      address: 'Wall Tax Road, Opposite Central Railway Station, Chennai - 600003',
      cityArea: 'Chennai Central',
      latitude: 13.0835,
      longitude: 80.2715,
      distanceKm: 0.4,
      phone: '+91 44 2530 0102',
      available24x7: true,
      services: ['24x7 Station Command', 'Transit Police Help Desk', 'Emergency Response Vehicle'],
      isDemoData: true
    },
    {
      id: 'pol_ann_1',
      name: 'K4 Anna Nagar Police Station',
      type: 'POLICE',
      address: '2nd Avenue, Near Anna Arch, Anna Nagar, Chennai - 600040',
      cityArea: 'Anna Nagar',
      latitude: 13.0885,
      longitude: 80.2105,
      distanceKm: 1.8,
      phone: '+91 44 2621 3400',
      available24x7: true,
      services: ['24x7 Patrol Response', 'Public Safety Command', 'Cyber Helpline Desk'],
      isDemoData: true
    },

    // FIRE STATIONS
    {
      id: 'fire_amb_1',
      name: 'Ambattur Industrial Estate Fire & Rescue Station',
      type: 'FIRE_STATION',
      address: '3rd Main Road, Industrial Estate, Ambattur, Chennai - 600058',
      cityArea: 'Ambattur',
      latitude: 13.111,
      longitude: 80.160,
      distanceKm: 1.7,
      phone: '+91 44 2625 1010',
      available24x7: true,
      services: ['24x7 Fire Tender Response', 'Chemical Safety Team', 'Disaster Rescue Squad'],
      isDemoData: true
    },
    {
      id: 'fire_cnt_1',
      name: 'High Court & Central Fire Station',
      type: 'FIRE_STATION',
      address: 'Esplanade Road, Near High Court, Chennai - 600104',
      cityArea: 'Chennai Central',
      latitude: 13.085,
      longitude: 80.275,
      distanceKm: 1.1,
      phone: '+91 44 2534 0101',
      available24x7: true,
      services: ['24x7 Emergency Dispatch', 'Water Bowser Unit', 'Urban Search & Rescue'],
      isDemoData: true
    },
    {
      id: 'fire_ann_1',
      name: 'Anna Nagar Fire & Rescue Station',
      type: 'FIRE_STATION',
      address: '1st Avenue, Opp. Tower Park, Anna Nagar, Chennai - 600040',
      cityArea: 'Anna Nagar',
      latitude: 13.086,
      longitude: 80.208,
      distanceKm: 2.3,
      phone: '+91 44 2621 1010',
      available24x7: true,
      services: ['24x7 Fire Rescue Unit', 'Hazardous Spill Control'],
      isDemoData: true
    }
  ];

  public async findNearbyFacilities(
    type: EmergencyFacilityType,
    areaOrCoords?: string | { lat: number; lng: number }
  ): Promise<EmergencyFacility[]> {
    let filtered = this.mockFacilities.filter((f) => f.type === type);

    if (typeof areaOrCoords === 'string' && areaOrCoords.trim()) {
      const areaLower = areaOrCoords.toLowerCase().trim();
      const matched = filtered.filter(
        (f) => f.cityArea.toLowerCase().includes(areaLower) || f.name.toLowerCase().includes(areaLower) || f.address.toLowerCase().includes(areaLower)
      );
      if (matched.length > 0) {
        filtered = matched;
      }
    }

    // Sort by distance
    filtered.sort((a, b) => a.distanceKm - b.distanceKm);

    return filtered.length > 0 ? filtered : this.mockFacilities.filter((f) => f.type === type);
  }

  public async getFacilityDetails(facilityId: string): Promise<EmergencyFacility | null> {
    const found = this.mockFacilities.find((f) => f.id === facilityId);
    return found || null;
  }
}
