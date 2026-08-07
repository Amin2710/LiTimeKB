// Device groupings for the error-code lookup.
//
// Lives outside ErrorCodesView so the global search index can label error codes
// with the device they belong to.

export interface DeviceGroup {
  key: string;
  label: string;
  category: 'solar-charge-controller' | 'inverter' | 'inverter-charger';
  brand: string;
}

export const DEVICE_GROUPS: DeviceGroup[] = [
  // Solar Charge Controllers
  { key: '30A_MPPT', label: '30A MPPT Smart', category: 'solar-charge-controller', brand: 'LiTime' },
  { key: '60A_MPPT', label: '60A MPPT Bluetooth', category: 'solar-charge-controller', brand: 'LiTime' },
  { key: '100A_MPPT', label: '100A MPPT Bluetooth', category: 'solar-charge-controller', brand: 'LiTime' },
  { key: '20A_PWM', label: '20A PWM', category: 'solar-charge-controller', brand: 'LiTime' },
  { key: '20A_PWM_WATERPROOF', label: '20A PWM Waterproof', category: 'solar-charge-controller', brand: 'LiTime' },
  // Inverters
  { key: '1000W_INVERTER', label: '1000W Inverter', category: 'inverter', brand: 'LiTime' },
  { key: '2000W_INVERTER', label: '2000W Inverter', category: 'inverter', brand: 'LiTime' },
  { key: '2000W_ATS_INVERTER', label: '2000W Inverter w/ ATS', category: 'inverter', brand: 'LiTime' },
  { key: '3000W_INVERTER', label: '3000W Inverter', category: 'inverter', brand: 'LiTime' },
  // Inverter Chargers
  { key: '3000W_INVERTER_CHARGER', label: '3000W Inverter Charger', category: 'inverter-charger', brand: 'LiTime' },
  { key: '24V_3000W_INVERTER_CHARGER', label: '24V 3000W Solar IC', category: 'inverter-charger', brand: 'LiTime' },
  { key: '48V_3500W_INVERTER_CHARGER', label: '48V 3500W All-in-One', category: 'inverter-charger', brand: 'LiTime' },
  { key: '48V_5KW_INVERTER_CHARGER', label: '48V 5kW Split Phase', category: 'inverter-charger', brand: 'LiTime' },
];

export const DEVICE_CATEGORIES = [
  { key: 'solar-charge-controller', label: 'MPPT / PWM' },
  { key: 'inverter', label: 'Inverters' },
  { key: 'inverter-charger', label: 'Inverter Chargers' },
];
