import type { IMobilityService } from './IMobilityService';
import type { Route, TransitOption, TransitStop, TransitVehicle, ETA } from '../../domain/models';

export class MockMobilityService implements IMobilityService {
  public name = 'Mock Chennai Transport Authority Engine';
  public isMock = true;

  private mockOptions: TransitOption[] = [
    {
      id: 'opt_amb_cnt_1',
      routeNumber: 'M92',
      title: 'Ambattur to Central Direct Express',
      origin: 'Ambattur',
      destination: 'Chennai Central',
      durationMinutes: 42,
      stopsCount: 8,
      walkingDistanceMinutes: 5,
      fare: '₹25',
      busType: 'AC Volvo',
      nextDeparture: 'In 6 mins (08:45 AM)',
      eta: {
        minutes: 6,
        estimatedArrival: '08:45 AM',
        trafficCondition: 'MODERATE'
      },
      stops: ['Ambattur OT', 'Padi Junction', 'Anna Nagar East', 'Kilpauk', 'EGMORE', 'Chennai Central'],
      vehicle: {
        id: 'veh_m92_1',
        vehicleNumber: 'TN-01-N-4921',
        busType: 'AC Volvo',
        currentStop: 'Padi Junction',
        status: 'ON_TIME'
      },
      isRecommended: true,
      isDemoData: true
    },
    {
      id: 'opt_amb_cnt_2',
      routeNumber: '21B',
      title: 'Electric Express Bypass',
      origin: 'Ambattur',
      destination: 'Chennai Central',
      durationMinutes: 38,
      stopsCount: 6,
      walkingDistanceMinutes: 3,
      fare: '₹30',
      busType: 'Electric Express',
      nextDeparture: 'In 10 mins (08:49 AM)',
      eta: {
        minutes: 10,
        estimatedArrival: '08:49 AM',
        trafficCondition: 'LIGHT'
      },
      stops: ['Ambattur OT', 'Collector Nagar', 'Aminjikarai', 'Chennai Central'],
      vehicle: {
        id: 'veh_21b_1',
        vehicleNumber: 'TN-01-E-8832',
        busType: 'Electric Express',
        currentStop: 'Collector Nagar',
        status: 'APPROACHING'
      },
      isRecommended: false,
      isDemoData: true
    },
    {
      id: 'opt_amb_cnt_3',
      routeNumber: '70H',
      title: 'Ordinary City Service',
      origin: 'Ambattur',
      destination: 'Chennai Central',
      durationMinutes: 50,
      stopsCount: 14,
      walkingDistanceMinutes: 8,
      fare: '₹15',
      busType: 'Ordinary Bus',
      nextDeparture: 'In 14 mins (08:53 AM)',
      eta: {
        minutes: 14,
        estimatedArrival: '08:53 AM',
        trafficCondition: 'HEAVY'
      },
      stops: ['Ambattur OT', 'Thirumangalam', 'Shenoy Nagar', 'Choolaimedu', 'Chennai Central'],
      vehicle: {
        id: 'veh_70h_1',
        vehicleNumber: 'TN-01-N-1204',
        busType: 'Ordinary Bus',
        currentStop: 'Thirumangalam',
        status: 'DELAYED'
      },
      isRecommended: false,
      isDemoData: true
    },
    {
      id: 'opt_gui_cnt_1',
      routeNumber: '47A',
      title: 'Guindy Metro Feeder Express',
      origin: 'Guindy',
      destination: 'Chennai Central',
      durationMinutes: 25,
      stopsCount: 5,
      walkingDistanceMinutes: 2,
      fare: '₹20',
      busType: 'Metro Feeder',
      nextDeparture: 'In 4 mins (08:43 AM)',
      eta: {
        minutes: 4,
        estimatedArrival: '08:43 AM',
        trafficCondition: 'LIGHT'
      },
      stops: ['Guindy Industrial Estate', 'Saidapet', 'T. Nagar', 'Chennai Central'],
      vehicle: {
        id: 'veh_47a_1',
        vehicleNumber: 'TN-01-M-3301',
        busType: 'Metro Feeder',
        currentStop: 'Saidapet',
        status: 'ON_TIME'
      },
      isRecommended: true,
      isDemoData: true
    },
    {
      id: 'opt_ann_ady_1',
      routeNumber: '47D',
      title: 'Anna Nagar to Adyar Circular',
      origin: 'Anna Nagar',
      destination: 'Adyar',
      durationMinutes: 30,
      stopsCount: 7,
      walkingDistanceMinutes: 4,
      fare: '₹22',
      busType: 'AC Volvo',
      nextDeparture: 'In 8 mins (08:47 AM)',
      eta: {
        minutes: 8,
        estimatedArrival: '08:47 AM',
        trafficCondition: 'MODERATE'
      },
      stops: ['Anna Nagar West', 'Loyola College', 'Mylapore', 'Adyar Signal'],
      vehicle: {
        id: 'veh_47d_1',
        vehicleNumber: 'TN-01-V-7712',
        busType: 'AC Volvo',
        currentStop: 'Loyola College',
        status: 'ON_TIME'
      },
      isRecommended: true,
      isDemoData: true
    }
  ];

  private mockStops: TransitStop[] = [
    {
      id: 'stop_amb_1',
      name: 'Ambattur OT Bus Terminal',
      cityArea: 'Ambattur',
      latitude: 13.1143,
      longitude: 80.1548,
      distanceKm: 0.3,
      walkingMinutes: 4
    },
    {
      id: 'stop_cnt_1',
      name: 'Chennai Central Station Bus Stand',
      cityArea: 'Chennai Central',
      latitude: 13.0827,
      longitude: 80.2707,
      distanceKm: 0.1,
      walkingMinutes: 2
    },
    {
      id: 'stop_ann_1',
      name: 'Anna Nagar West Bus Depot',
      cityArea: 'Anna Nagar',
      latitude: 13.0878,
      longitude: 80.2091,
      distanceKm: 0.5,
      walkingMinutes: 6
    },
    {
      id: 'stop_gui_1',
      name: 'Guindy Industrial Estate Stop',
      cityArea: 'Guindy',
      latitude: 13.0067,
      longitude: 80.202,
      distanceKm: 0.2,
      walkingMinutes: 3
    },
    {
      id: 'stop_tng_1',
      name: 'T. Nagar Bus Terminus',
      cityArea: 'T. Nagar',
      latitude: 13.0418,
      longitude: 80.2341,
      distanceKm: 0.4,
      walkingMinutes: 5
    }
  ];

  public async getRoutes(origin?: string, destination?: string): Promise<Route[]> {
    const origLower = (origin || '').toLowerCase();
    const destLower = (destination || '').toLowerCase();

    // Filter matching options
    let filtered = this.mockOptions.filter((opt) => {
      const matchOrig = !origLower || opt.origin.toLowerCase().includes(origLower) || origLower.includes(opt.origin.toLowerCase());
      const matchDest = !destLower || opt.destination.toLowerCase().includes(destLower) || destLower.includes(opt.destination.toLowerCase());
      return matchOrig && matchDest;
    });

    // Fallback if specific route not found in static list
    if (filtered.length === 0 && (origin || destination)) {
      filtered = [
        {
          id: `opt_gen_${Date.now()}`,
          routeNumber: 'M21-X',
          title: `${origin || 'Current Location'} to ${destination || 'City Hub'} Transit`,
          origin: origin || 'City Area',
          destination: destination || 'City Central',
          durationMinutes: 35,
          stopsCount: 7,
          walkingDistanceMinutes: 4,
          fare: '₹20',
          busType: 'AC Volvo',
          nextDeparture: 'In 7 mins',
          eta: {
            minutes: 7,
            estimatedArrival: 'In 7 mins',
            trafficCondition: 'LIGHT'
          },
          stops: [origin || 'Start Station', 'Midway Bus Stop', destination || 'Central Station'],
          vehicle: {
            id: 'veh_gen_1',
            vehicleNumber: 'TN-01-N-9900',
            busType: 'AC Volvo',
            status: 'ON_TIME'
          },
          isRecommended: true,
          isDemoData: true
        }
      ];
    }

    const routeName = `${origin || 'Origin'} → ${destination || 'Destination'}`;
    return [
      {
        id: `route_${Date.now()}`,
        routeName,
        origin: origin || 'City Area',
        destination: destination || 'City Central',
        options: filtered.length > 0 ? filtered : this.mockOptions
      }
    ];
  }

  public async getNearbyStops(locationOrArea?: string): Promise<TransitStop[]> {
    if (!locationOrArea) {
      return this.mockStops;
    }

    const areaLower = locationOrArea.toLowerCase();
    const matched = this.mockStops.filter((s) =>
      s.name.toLowerCase().includes(areaLower) || s.cityArea.toLowerCase().includes(areaLower)
    );

    return matched.length > 0 ? matched : this.mockStops;
  }

  public async getBusStatus(routeNumber?: string, destination?: string): Promise<TransitVehicle[]> {
    let matches = this.mockOptions;
    if (routeNumber) {
      matches = matches.filter((o) => o.routeNumber.toLowerCase().includes(routeNumber.toLowerCase()));
    }
    if (destination) {
      matches = matches.filter((o) => o.destination.toLowerCase().includes(destination.toLowerCase()));
    }

    const vehicles: TransitVehicle[] = (matches.length > 0 ? matches : this.mockOptions)
      .map((o) => o.vehicle)
      .filter((v): v is TransitVehicle => !!v);

    return vehicles;
  }

  public async getETA(routeIdOrNumber: string, _origin?: string, _destination?: string): Promise<ETA | null> {
    const rLower = routeIdOrNumber.toLowerCase();
    const found = this.mockOptions.find(
      (o) => o.id.toLowerCase() === rLower || o.routeNumber.toLowerCase() === rLower || o.title.toLowerCase().includes(rLower)
    );

    if (found) {
      return found.eta;
    }

    return {
      minutes: 8,
      estimatedArrival: 'In 8 mins',
      trafficCondition: 'MODERATE'
    };
  }
}
