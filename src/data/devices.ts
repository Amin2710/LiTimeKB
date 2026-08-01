export interface ErrorCode {
  code: string;
  reason: string;
  solution: string;
  note?: string;
}

export interface DeviceSpec {
  brand: 'LiTime' | 'Redodo' | 'Power Queen';
  model: string;
  category: 'solar-charge-controller' | 'inverter' | 'inverter-charger' | 'dc-dc-charger';
  type: 'MPPT' | 'PWM' | 'Pure Sine Wave' | 'Pure Sine Wave Inverter Charger';
  specs: Record<string, string>;
  features: string[];
  url: string;
}

export const DEVICES: DeviceSpec[] = [
  // ===== LiTime Solar Charge Controllers =====
  {
    brand: 'LiTime',
    model: '30A MPPT Smart',
    category: 'solar-charge-controller',
    type: 'MPPT',
    specs: {
      'System Voltage': '12V/24V/AUTO',
      'Rated Charging Current': '30A',
      'Rated Load Current': '20A',
      'Max Solar Input Power': '450W (12V) / 900W (24V)',
      'Max Solar Input Voltage': '100V',
      'Battery Voltage Range': '9V to 32V',
      'MPPT Voltage Range': 'Battery Voltage+3V to 76V',
      'Default Battery': '12V LI (LiFePO4)',
    },
    features: ['Bluetooth integrated', 'LCD display', 'Aluminum alloy heatsink'],
    url: 'https://www.litime.com/products/30a-mppt-solar-charge-controller',
  },
  {
    brand: 'LiTime',
    model: '60A MPPT Bluetooth',
    category: 'solar-charge-controller',
    type: 'MPPT',
    specs: {
      'System Voltage': '12V/24V/36V/48V',
      'Rated Charging Current': '60A',
      'Rated Load Current': '20A',
      'Max Solar Input Power': '900W (12V) / 1800W (24V) / 2600W (36V) / 3200W (48V)',
      'Max Solar Input Voltage': '150V',
      'Battery Voltage Range': '9V - 64V',
      'MPPT Voltage Range': 'Battery Voltage+3V to 120V',
      'No-Load Loss': '12mA (12V) / 10mA (24V) / 6mA (36V/48V)',
      'Default Battery': '12V LI (LiFePO4)',
    },
    features: ['Bluetooth', 'LCD display', 'Capacitive load support'],
    url: 'https://www.litime.com/products/60a-mppt-with-bluetooth',
  },
  {
    brand: 'LiTime',
    model: '100A MPPT Bluetooth',
    category: 'solar-charge-controller',
    type: 'MPPT',
    specs: {
      'System Voltage': '12V/24V/36V/48V/Auto',
      'Rated Charging Current': '100A',
      'Max Solar Input Power': '1500W (12V) / 3000W (24V) / 4500W (36V) / 6000W (48V)',
      'Max Solar Input Voltage': '150V',
      'MPPT Voltage Range': 'Battery Voltage+3V to 120V',
      'No-Load Loss': '<10mA (12V) / <6mA (24V) / <5mA (36V) / <4mA (48V)',
      'Battery Types': 'LI, SEL, GEL, FLD, USE',
      'Low-Temp Protection': 'Cuts off <32°F, resumes ≥41°F',
    },
    features: ['Bluetooth', 'Backlit LCD', 'Low-temp charging protection', 'Wide battery compatibility'],
    url: 'https://www.litime.com/products/100a-mppt-bluetooth-solar-charge-controller',
  },
  {
    brand: 'LiTime',
    model: '20A PWM',
    category: 'solar-charge-controller',
    type: 'PWM',
    specs: {
      'System Voltage': '12V/24V',
      'Rated Charging Current': '20A',
      'Rated Load Current': '20A',
      'Max Solar Input Power': '340W (12V) / 680W (24V)',
      'Max Solar Input Voltage': '<55V',
      'No-Load Loss': '8mA (12V) / 12mA (24V)',
    },
    features: ['LCD display', 'LED indicators', 'Budget-friendly'],
    url: 'https://www.litime.com/products/20a-pwm-solar-charge-controller',
  },
  {
    brand: 'LiTime',
    model: '20A PWM Smart Waterproof',
    category: 'solar-charge-controller',
    type: 'PWM',
    specs: {
      'System Voltage': '12V/24V',
      'Rated Charging Current': '20A',
      'Max Solar Input Power': '340W (12V) / 680W (24V)',
      'Max Solar Input Voltage': '<55V',
      'No-Load Loss': '7mA (12V) / 12mA (24V)',
    },
    features: ['Bluetooth', 'Waterproof', 'Compact design'],
    url: 'https://www.litime.com/products/20a-pwm-controller-with-bluetooth',
  },

  // ===== LiTime Inverters =====
  {
    brand: 'LiTime',
    model: '1000W Pure Sine Wave Inverter',
    category: 'inverter',
    type: 'Pure Sine Wave',
    specs: {
      'Continuous Power': '1000W',
      'Surge Power': '2000W',
      'Input Voltage': '12V DC',
      'Input Voltage Range': '10.0V - 15.5V DC',
      'AC Output': '120V AC ± 10%',
      'No Load Power': '<8W',
      'Low Voltage Cutoff': '10.0 ± 0.5V DC',
      'Over Voltage Cutoff': '15.5 ± 0.5V DC',
    },
    features: ['Pure sine wave', 'LCD display', 'Multiple protections'],
    url: 'https://www.litime.com/products/litime-1000w-12v-pure-sine-wave-inverter',
  },
  {
    brand: 'LiTime',
    model: '2000W Pure Sine Wave Inverter',
    category: 'inverter',
    type: 'Pure Sine Wave',
    specs: {
      'Continuous Power': '2000W',
      'Surge Power': '4000W',
      'Input Voltage': '12V DC',
      'Input Voltage Range': '10.5V - 16.0V DC',
      'AC Output': '120V AC ± 10%',
      'Efficiency': '85% - 95%',
      'No Load Power': '<9W',
      'Low Voltage Cutoff': '10.5 ± 0.5V DC',
      'Over Voltage Cutoff': '16.0 ± 0.5V DC',
    },
    features: ['USB-A + USB-C ports', '4 AC outlets', 'Remote LCD', 'CE/FCC/RoHS certified'],
    url: 'https://www.litime.com/products/litime-2000-watt-12v-pure-sine-wave-inverter',
  },
  {
    brand: 'LiTime',
    model: '2000W Pure Sine Wave Inverter with ATS',
    category: 'inverter',
    type: 'Pure Sine Wave',
    specs: {
      'Continuous Power': '2000W',
      'Surge Power': '4000W',
      'Input Voltage': '12V DC',
      'Input Voltage Range': '10.5V - 16.0V DC',
      'AC Output': '120V AC',
      'ATS Transfer': '20ms seamless switching',
      'Operating Temperature': '-20°C to 40°C',
    },
    features: ['Built-in ATS 20ms transfer', 'Grid/battery auto switching', 'Pure sine wave', 'All-weather rated'],
    url: 'https://www.litime.com/products/2000w-12v-pure-sine-wave-inverter-with-20ms-ats',
  },
  {
    brand: 'LiTime',
    model: '3000W Pure Sine Wave Inverter',
    category: 'inverter',
    type: 'Pure Sine Wave',
    specs: {
      'Continuous Power': '3000W',
      'Surge Power': '6000W',
      'Input Voltage': '12V DC',
      'Input Voltage Range': '10.5 - 16.0V DC',
      'AC Output': '120V AC ± 10%',
      'USB Output': '5.0V DC / 2.4A',
      'Low Voltage Cutoff': '9.5 ± 0.5V DC',
      'Over Voltage Cutoff': '16.5 ± 0.5V DC',
      'Operating Temperature': '-25°C to 65°C',
    },
    features: ['Remote LCD display', '4 AC outlets', 'USB-C + USB-A', 'Dual cooling fans'],
    url: 'https://www.litime.com/products/litime-3000w-12v-pure-sine-wave-inverter',
  },
  {
    brand: 'LiTime',
    model: '3000W Inverter Charger',
    category: 'inverter-charger',
    type: 'Pure Sine Wave Inverter Charger',
    specs: {
      'Rated Output Power': '3000W',
      'Surge Power (10s)': '9000W',
      'AC Output': '110V ± 10%',
      'DC Input Range': '10.5V to 16.0V',
      'No Load Power': '<38W (Normal Mode)',
      'AC Input (Charger)': '110V ± 10%',
      'Output Current (Charger)': '5A to 45A',
      'Battery Types': 'LiFePO4, AGM, SLA, Gel, Open Lead Acid, Calcium, De Sulphation',
    },
    features: ['Integrated inverter + charger + UPS', 'Remote LCD (23ft cable)', 'Grid/inverter mode switching', 'Smart alarm system'],
    url: 'https://www.litime.com/products/3000w-pure-sine-wave-inverter-charger',
  },
  {
    brand: 'LiTime',
    model: '24V 3000W Pure Sine Wave Solar Inverter Charger',
    category: 'inverter-charger',
    type: 'Pure Sine Wave Inverter Charger',
    specs: {
      'Rated Output Power': '3000W',
      'Surge Power': '9000W',
      'Input Voltage': '24V DC',
      'AC Output': '110V',
      'MPPT': '60A built-in',
      'Charger': '50A built-in',
      'Battery Types': 'Lithium, Lead-acid',
    },
    features: ['3-in-1: 60A MPPT + 3000W inverter + 50A charger', 'UPS function', 'LCD display'],
    url: 'https://www.litime.com/products/24v-3000w-pure-sine-wave-inverter-charger',
  },
  {
    brand: 'LiTime',
    model: '48V 3500W All-in-One Solar Inverter Charger',
    category: 'inverter-charger',
    type: 'Pure Sine Wave Inverter Charger',
    specs: {
      'Rated Output Power': '3500W',
      'Surge Power': '6000W',
      'Input Voltage': '48V DC',
      'MPPT': '80A built-in',
      'Charger': '40A built-in',
      'PV Voltage Range': '60V - 145V',
    },
    features: ['3-in-1: MPPT + inverter + charger', 'UPS function', 'LCD display', 'Home energy storage'],
    url: 'https://www.litime.com/products/48v-3500w-solar-converter-charger',
  },
  {
    brand: 'LiTime',
    model: '48V 5kW Split Phase All-in-One Solar Inverter Charger',
    category: 'inverter-charger',
    type: 'Pure Sine Wave Inverter Charger',
    specs: {
      'Rated Output Power': '5000W',
      'Input Voltage': '48V DC',
      'MPPT': '100A built-in',
      'Charger': '40A built-in',
      'PV Voltage Range': '120V - 500V',
      'Parallel Support': 'Up to 6 units (30kW total)',
      'Split Phase': '120V/240V (2+ units)',
    },
    features: ['3-in-1: 100A MPPT + 5kW inverter + 40A charger', 'Parallel up to 6 units', 'Split-phase 120V/240V', 'USER mode for custom batteries'],
    url: 'https://www.litime.com/products/48v-5kw-solar-inverter-charger',
  },

  // ===== LiTime DC-DC Charger =====
  {
    brand: 'LiTime',
    model: '12V 40A DC-DC Charger with MPPT',
    category: 'dc-dc-charger',
    type: 'MPPT',
    specs: {
      'System Voltage': '12V DC',
      'Charging Current': '40A',
      'Charging Voltage Range': '7V to 15.4V',
      'Max Alternator Input': '600W',
      'Max Solar Input': '600W / 30V',
      'Min Solar Input Voltage': '10V',
      'Battery Types': 'SLA, AGM, GEL, CA, LI',
    },
    features: ['Built-in MPPT solar input', 'Dual alternator + solar charging', 'Compact design', 'Anderson connectors'],
    url: 'https://www.litime.com/products/litime-12v-40a-dc-dc-battery-charger',
  },

  // ===== Redodo Solar Charge Controllers =====
  {
    brand: 'Redodo',
    model: '40A MPPT Solar Charge Controller',
    category: 'solar-charge-controller',
    type: 'MPPT',
    specs: {
      'System Voltage': '12V/24V/AUTO',
      'Rated Charging Current': '40A',
      'Rated Load Current': '20A',
      'Max Solar Input Power': '600W (12V) / 1200W (24V)',
      'Max Solar Input Voltage': '100V',
      'Battery Voltage Range': '9V to 32V',
      'Default Battery': '12V LI (LiFePO4)',
      'Compatible Batteries': 'LiFePO4 (default), FLD, AGM sealed, Gel lead-acid',
    },
    features: ['LCD display + LED indicators', '4 operating buttons', 'Aluminum alloy heatsink', '99% tracking efficiency', '98% peak conversion'],
    url: 'https://www.redodopower.com/products/redodo-40a-mppt-12v-24v-solar-charge-controller',
  },

  // ===== Redodo Inverters =====
  {
    brand: 'Redodo',
    model: '2000W Pure Sine Wave Inverter',
    category: 'inverter',
    type: 'Pure Sine Wave',
    specs: {
      'Continuous Power': '2000W',
      'Surge Power': '4000W',
      'Input Voltage': '12V DC',
      'Input Voltage Range': '10.0V - 15.5V DC',
      'AC Output': '110V',
      'Efficiency': '90%',
    },
    features: ['LCD monitor', 'Real-time battery status', 'Cooling fans', 'Over-voltage/low-voltage/overload protection'],
    url: 'https://www.redodopower.com/products/redodo-2000w-power-inverter-18a-max-ac-outlets-lcd-monitor',
  },
  {
    brand: 'Redodo',
    model: '3000W Pure Sine Wave Inverter Charger',
    category: 'inverter-charger',
    type: 'Pure Sine Wave Inverter Charger',
    specs: {
      'Continuous Power': '3000W',
      'Surge Power': '9000W',
      'Input Voltage': '12V DC',
      'Input Voltage Range': '10.5V - 16.0V DC',
      'AC Output': '110V ± 10%',
      'Built-in Charger': '45A',
      'Battery Types': 'Gel, AGM, SLA, CAL, LiFePO4 (with Li activation)',
      'Power Saving Mode': '<4W',
    },
    features: ['Inverter + charger + UPS all-in-one', 'Remote control', 'LCD display', 'Seamless grid switching'],
    url: 'https://www.redodopower.com/products/redodo-3000w-pure-sine-wave-inverter-charger',
  },

  // ===== Redodo DC-DC Charger =====
  {
    brand: 'Redodo',
    model: '12V 40A DC-DC Charger with MPPT',
    category: 'dc-dc-charger',
    type: 'MPPT',
    specs: {
      'System Voltage': '12V DC',
      'Charging Current': '40A',
      'Charging Voltage Range': '7V to 15.4V',
      'Max Alternator Input': '600W',
    },
    features: ['Built-in MPPT', 'Compact design (5.8×1.89×7.44 in)', '2.43 lbs', 'Anderson connectors', 'Easy installation'],
    url: 'https://www.redodopower.com/products/redodo-12v-40a-dc-to-dc-charger-with-mppt',
  },

  // ===== Power Queen Solar Charge Controllers =====
  {
    brand: 'Power Queen',
    model: '30A MPPT Solar Charge Controller with Bluetooth',
    category: 'solar-charge-controller',
    type: 'MPPT',
    specs: {
      'System Voltage': '12V/24V/AUTO',
      'Rated Charging Current': '30A',
      'Rated Load Current': '20A',
      'Max Solar Input Power': '450W (12V) / 900W (24V)',
      'Max Solar Input Voltage': '100V',
      'Battery Voltage Range': '9V to 32V',
      'MPPT Voltage Range': 'Battery Voltage+3V to 76V',
      'Default Battery': '12V LI (LiFePO4)',
    },
    features: ['Bluetooth built-in', 'LCD display', 'Multiple battery chemistry support'],
    url: 'https://www.ipowerqueen.com/products/power-queen-12-24v-30-amp-mppt-solar-charge-controller-and-bluetooth-adapter',
  },
  {
    brand: 'Power Queen',
    model: '20A PWM Waterproof Solar Charger Controller',
    category: 'solar-charge-controller',
    type: 'PWM',
    specs: {
      'System Voltage': '12V/24V',
      'Rated Charging Current': '20A',
      'Rated Load Current': '20A',
      'Max Solar Input Power': '340W (12V) / 680W (24V)',
      'Max Solar Input Voltage': '<55V',
      'No-Load Loss': '8mA (12V) / 12mA (24V)',
    },
    features: ['Waterproof', 'LCD display', 'Budget-friendly'],
    url: 'https://www.ipowerqueen.com/products/power-queen-20a-12v-24v-pwm-waterproof-solar-charger-controller',
  },

  // ===== Power Queen Inverters =====
  {
    brand: 'Power Queen',
    model: '2000W Solar Power Inverter',
    category: 'inverter',
    type: 'Pure Sine Wave',
    specs: {
      'Continuous Power': '2000W',
      'Surge Power': '4000W',
      'Input Voltage': '12V DC',
      'Input Voltage Range': '10.0V - 15.5V DC',
      'AC Output': '110V AC ± 10%',
      'No Load Power': '<9W',
      'Low Voltage Cutoff': '10.0 ± 0.3V DC',
      'Over Voltage Cutoff': '15.5V ± 0.3V DC',
    },
    features: ['2 AC outlets', 'LCD display', 'Multiple protections'],
    url: 'https://www.ipowerqueen.com/products/power-queen-2000w-solar-power-inverter-12v-dc-to-110v-120v-ac-converter-with-2-ac-outlets',
  },
  {
    brand: 'Power Queen',
    model: '3000W Pure Sine Wave Inverter',
    category: 'inverter',
    type: 'Pure Sine Wave',
    specs: {
      'Continuous Power': '3000W',
      'Surge Power': '6000W',
      'Input Voltage': '12V DC',
      'AC Output': '110V AC, 60Hz',
      'Efficiency': '90%+',
    },
    features: ['7 outlets (4 AC + 1 high output terminal + USB-A + USB-C)', 'LCD remote control', 'Dual cooling fans'],
    url: 'https://www.ipowerqueen.com/products/power-queen-3000w-pure-sine-wave-inverter-12v-dc-to-110v-ac-converter-with-7-outlets-lcd-remote-control',
  },

  // ===== Power Queen DC-DC Charger =====
  {
    brand: 'Power Queen',
    model: '12V 40A DC-DC Battery Charger',
    category: 'dc-dc-charger',
    type: 'MPPT',
    specs: {
      'System Voltage': '12V DC',
      'Charging Current': '40A',
      'Charging Voltage (Lithium)': '14.6V',
      'Charging Voltage (Lead Acid)': '14.4V - 14.8V',
      'Max Alternator Input': '680W',
      'House Battery Voltage Range': '11.3V to 16.0V',
      'Standby Consumption': '<0.6A',
      'Max Solar Input': '600W / 30V (max 20A input)',
      'Temp Compensation': '-3mV/°C/2V (Lead Acid only)',
    },
    features: ['Built-in MPPT', 'Lithium and Lead Acid charging profiles', 'Temperature compensation', 'Compact design'],
    url: 'https://www.ipowerqueen.com/products/power-queen-12v-40a-dc-to-dc-battery-charger',
  },
];

// ===== Error Codes by Device Model =====
// Each device model has its own error code set based on firmware/chipset

export const ERROR_CODES: Record<string, ErrorCode[]> = {
  // 30A MPPT (12V/24V) — also used by Redodo 40A MPPT and Power Queen 30A MPPT
  '30A_MPPT': [
    { code: 'E00', reason: 'No Error', solution: 'System is working normally.' },
    { code: 'E01', reason: 'Battery Over-discharged', solution: 'The battery voltage is too low. DC load will be turned off until the battery re-charges to recovery voltage.' },
    { code: 'E02', reason: 'Battery Over-voltage', solution: 'Check battery bank voltage for compatibility with the controller.', note: 'Restart/shutdown required' },
    { code: 'E04', reason: 'Load Short Circuit', solution: 'Disconnect the load and check if the rated current of the load is less than 20A.' },
    { code: 'E05', reason: 'Load Overloading', solution: 'Reduce load size or upgrade to a controller with higher DC load capacity.' },
    { code: 'E06', reason: 'Overheating', solution: 'Ensure the controller is placed in a well-ventilated, cool, dry place.' },
    { code: 'E07', reason: 'Environmental Over-temperature', solution: 'The environment temperature detected by the external temperature probe is too high.' },
    { code: 'E10', reason: 'Solar Over-voltage', solution: 'Decrease the voltage of solar panels connected to the controller.' },
    { code: 'E13', reason: 'Solar Reverse Polarity', solution: 'Disconnect and re-connect in the correct polarities.' },
    { code: 'E14', reason: 'Battery Reverse Polarity', solution: 'Disconnect and re-connect in correct polarities.' },
    { code: 'E15', reason: 'Under Low Temperature Charging Protection', solution: 'Increase the ambient temperature above 5°C / 41°F.' },
  ],
  // 60A MPPT (12V/24V/36V/48V) — expanded error code set
  '60A_MPPT': [
    { code: 'E000', reason: 'No Error', solution: 'System is working normally.' },
    { code: 'E001', reason: 'Battery Over-voltage', solution: 'Check if the battery voltage for the controller is correctly selected. If yes, discharge the battery. If not, set the correct battery voltage.' },
    { code: 'E002', reason: 'Solar Over-voltage', solution: 'The open-circuit voltage of the solar panel is higher than the open-circuit voltage range of the controller. Recommended to reduce the number of solar panels.' },
    { code: 'E004', reason: 'Charging Hardware Over-current', solution: 'Reduce the charging current.' },
    { code: 'E008', reason: 'Load Over-current', solution: 'Reduce the number of loads.' },
    { code: 'E010', reason: 'Environmental Over-temperature', solution: 'The ambient temperature detected by the external temperature sensor is too high.' },
    { code: 'E020', reason: 'Controller Over-temperature', solution: 'Ensure the controller is installed in a well-ventilated, cool and dry place.' },
    { code: 'E040', reason: 'Solar Under-voltage', solution: 'The open-circuit voltage of the solar panel is lower than the open-circuit voltage range of the controller. Increase the number of solar panels (total voltage cannot exceed 200V).' },
    { code: 'E080', reason: 'Battery Under-voltage', solution: 'Check if the battery voltage for the controller is correctly selected. If yes, charge the battery. If not, set the correct battery voltage.' },
    { code: 'E100', reason: 'Controller Internal Failure', solution: 'Stop using the controller and contact the support team at service@litime.com for assistance.' },
    { code: 'E400', reason: 'Failed to Recognize Lead-acid Battery', solution: 'Check the battery type; Check the battery health status; Verify if the battery voltage is within the MPPT controller operating range; Check if the battery is correctly connected.' },
    { code: 'E800', reason: 'Under Low Temperature Charging Protection', solution: 'Increase the ambient temperature above 5°C / 41°F.' },
  ],
  // 100A MPPT (12V/24V/36V/48V) — simplified error code set
  '100A_MPPT': [
    { code: 'E01', reason: 'Battery Over-voltage', solution: 'The battery voltage has exceeded the controller limit. Check battery bank voltage for compatibility with the controller.' },
    { code: 'E02', reason: 'Solar Over-voltage', solution: 'Solar array voltage exceeds controller-rated input voltage. Decrease the voltage of solar panels connected to the controller.' },
    { code: 'E08', reason: 'Battery Over-discharged', solution: 'The battery voltage is too low. DC load will be turned off until the battery re-charges to recovery voltage.' },
    { code: 'E13', reason: 'Solar Reverse Polarity', solution: 'Solar array input wires connected with reverse polarities. Disconnect and re-connect in the correct polarities.' },
    { code: 'E14', reason: 'Battery Reverse Polarity', solution: 'Battery wires connected with reverse polarities. Disconnect and re-connect in the correct polarities.' },
    { code: 'E20', reason: 'Overheating', solution: 'The controller exceeds the operating temperature limit. Ensure the controller is placed in a well-ventilated, cool, dry place.' },
    { code: 'E21', reason: 'Under Low Temperature Charging Protection', solution: 'Increase the ambient temperature above 5°C / 41°F.' },
  ],
  // 20A PWM (Non-waterproof) — E-code display
  '20A_PWM': [
    { code: 'E00', reason: 'No Error', solution: 'System is working normally.' },
    { code: 'E01', reason: 'Battery Over-discharged', solution: 'Battery voltage is too low. DC load will be turned off until battery re-charges to recovery voltage.' },
    { code: 'E02', reason: 'Battery Over-voltage', solution: 'Battery voltage has exceeded controller limit. Check battery system voltage for compatibility with controller.' },
    { code: 'E04', reason: 'Load Short Circuit', solution: 'DC load short circuit. Disconnect the load and check if the rated current of the load is less than 20A.' },
    { code: 'E05', reason: 'Load Overload', solution: 'DC load power draw exceeds controller capability. Reduce load size or upgrade to a controller with higher DC load capacity.' },
    { code: 'E06', reason: 'Overheating', solution: 'The controller exceeds operating temperature limit. Ensure the controller is placed in a well-ventilated, cool, dry place.' },
    { code: 'E10', reason: 'Solar Over-voltage', solution: 'Solar array voltage exceeds controller rated input voltage. Decrease the voltage of solar panels connected to the controller.' },
  ],
  // 20A PWM Waterproof Bluetooth — LED indicator based (no E-codes)
  '20A_PWM_WATERPROOF': [
    { code: 'PV LED Flashes Quickly', reason: 'Solar Over-voltage', solution: 'Decrease the voltage of solar panels connected to the controller.' },
    { code: 'Battery LED Flashes Slowly', reason: 'Battery Over-discharged', solution: 'DC load will be turned off until the battery are re-charged to recovery voltage.' },
    { code: 'Battery LED Flashes Quickly', reason: 'Battery Over-voltage', solution: 'Check battery system voltage for compatibility with controller.' },
    { code: 'DC Load LED Flashes Slowly', reason: 'Load Overload', solution: 'Reduce load size or upgrade to a controller with higher DC load capacity.' },
    { code: 'DC Load LED Flashes Quickly', reason: 'Load Short Circuit', solution: 'Disconnect the load and check if the rated current of the load is less than 20A.' },
  ],

  // ===== LiTime Inverters =====
  // 1000W — descriptive faults (no numeric codes), LCD display
  '1000W_INVERTER': [
    { code: 'DC Input High', reason: 'DC input (battery) voltage is too high.', solution: 'Ensure the battery voltage is lower than about 15.5V.' },
    { code: 'DC Input Low', reason: 'DC input (battery) voltage is too low.', solution: 'Charge the battery or check the battery connections. Ensure the battery voltage is higher than about 10.0V.' },
    { code: 'Over Temperature', reason: 'The inverter temperature is too high.', solution: 'Cool down the product to room temperature. Place the inverter in a cool and well-ventilated room, or reduce the load power on the inverter.' },
    { code: 'Overload', reason: 'The load power on the inverter is higher than the rated power.', solution: 'Reduce the load power.' },
  ],
  // 2000W — Fault 2-8 system (65°C threshold)
  '2000W_INVERTER': [
    { code: 'Fault 2', reason: 'Input voltage is below 11.0±0.5V.', solution: 'Keep input voltage above 12.5±0.5V.', note: 'Alarm beeps' },
    { code: 'Fault 3', reason: 'Input voltage is above 16.0±0.5V.', solution: 'Keep input voltage below 14.0±0.5V.', note: 'Red LED lit' },
    { code: 'Fault 4', reason: 'Input voltage is below 10.5±0.5V.', solution: 'Keep input voltage above 12.5±0.5V.', note: 'Red LED lit' },
    { code: 'Fault 6', reason: 'Overload protection.', solution: 'Reduce the load power.', note: 'Red LED lit' },
    { code: 'Fault 7', reason: 'The temperature is above 149°F±9°F (65°C±5°C).', solution: 'Cool down the inverter to 131°F±9°F (55°C±5°C). Check for adequate venting. Reduce the load on inverter.', note: 'Red LED lit' },
    { code: 'Fault 8', reason: 'Short circuit.', solution: 'Disconnect and check the load, make sure the load is good, reconnect it then restart the inverter.', note: 'Red LED lit' },
    { code: 'No Output Voltage', reason: 'Switch is off.', solution: 'Turn on the switch of inverter or remote control.' },
    { code: 'Poor Connection', reason: 'Poor connections with the battery.', solution: 'Make sure the connection is good.' },
  ],
  // 2000W ATS — Fault 2-8 system (75°C threshold)
  '2000W_ATS_INVERTER': [
    { code: 'Fault 2', reason: 'Input voltage is below 11.0±0.5V.', solution: 'Keep input voltage above 12.5±0.5V.', note: 'Alarm beeps' },
    { code: 'Fault 3', reason: 'Input voltage is above 16.0±0.5V.', solution: 'Keep input voltage below 14.0±0.5V.', note: 'Red LED lit' },
    { code: 'Fault 4', reason: 'Input voltage is below 10.5±0.5V.', solution: 'Keep input voltage above 12.5±0.5V.', note: 'Red LED lit' },
    { code: 'Fault 6', reason: 'Overload protection.', solution: 'Reduce the load power.', note: 'Red LED lit' },
    { code: 'Fault 7', reason: 'The temperature is above 167°F±9°F (75°C±5°C).', solution: 'Cool down the inverter to 131°F±9°F (55°C±5°C). Check for adequate venting. Reduce the load on inverter.', note: 'Red LED lit' },
    { code: 'Fault 8', reason: 'Output short circuit protection.', solution: 'Disconnect and check the load, make sure the load is good, reconnect it then restart the inverter.', note: 'Red LED lit' },
    { code: 'No Output Voltage', reason: 'Switch is off.', solution: 'Turn on the switch of inverter or remote control.' },
    { code: 'Poor Connection', reason: 'Poor connections with the battery.', solution: 'Make sure the connection is good.' },
  ],
  // 3000W — Fault 2-8 system (75°C threshold, matches ATS variant)
  '3000W_INVERTER': [
    { code: 'Fault 2', reason: 'Input voltage is below 11.0±0.5V.', solution: 'Keep input voltage above 12.5±0.5V.', note: 'Alarm beeps' },
    { code: 'Fault 3', reason: 'Input voltage is above 16.0±0.5V.', solution: 'Keep input voltage below 14.0±0.5V.', note: 'Red LED lit' },
    { code: 'Fault 4', reason: 'Input voltage is below 10.5±0.5V.', solution: 'Keep input voltage above 12.5±0.5V.', note: 'Red LED lit' },
    { code: 'Fault 6', reason: 'Overload protection.', solution: 'Reduce the load power.', note: 'Red LED lit' },
    { code: 'Fault 7', reason: 'The temperature is above 167°F±9°F (75°C±5°C).', solution: 'Cool down the inverter to 131°F±9°F (55°C±5°C). Check for adequate venting. Reduce the load on inverter.', note: 'Red LED lit' },
    { code: 'Fault 8', reason: 'Output short circuit protection.', solution: 'Disconnect and check the load, make sure the load is good, reconnect it then restart the inverter.', note: 'Red LED lit' },
    { code: 'No Output Voltage', reason: 'Switch is off.', solution: 'Turn on the switch of inverter or remote control.' },
    { code: 'Poor Connection', reason: 'Poor connections with the battery.', solution: 'Make sure the connection is good.' },
  ],

  // ===== LiTime Inverter Chargers =====
  // 3000W Inverter Charger — descriptive faults
  '3000W_INVERTER_CHARGER': [
    { code: 'No Power-Up', reason: 'Batteries not connected / loose connection on the battery side / low battery voltage.', solution: 'Check the batteries and cable connections or DC fuse and breaker. Charge the battery.' },
    { code: 'No AC Output / Indicators Off', reason: 'Inverter has been manually switched to OFF position.', solution: 'Turn the power switch to ON position.' },
    { code: 'Low AC Output / Quick Shutdown', reason: 'Low battery voltage.', solution: 'Check the condition of the batteries and recharge the battery first.' },
    { code: 'Charger Not Working', reason: 'AC voltage has exceeded the tolerance range.', solution: 'Check the AC voltage for proper voltage and frequency.' },
    { code: 'Charger Turns Off (Generator)', reason: 'High AC input voltages from the generator.', solution: 'Turn the generator output voltage down.' },
  ],
  // 24V 3000W Solar Inverter Charger — display codes
  '24V_3000W_INVERTER_CHARGER': [
    { code: 'No Display', reason: 'Screen is off / in sleep mode / DC fuse blown.', solution: 'Check if the battery/PV breaker/fuse is ON. Press any button to exit sleep mode. Check if DC fuse is blown and contact service@litime.com if replacement needed.' },
    { code: 'Fan Failure', reason: 'Fan not turning or blocked by objects.', solution: 'Check if the fan is not turning or blocked by objects.' },
    { code: '134 / 235', reason: 'Battery low voltage.', solution: 'Charge the battery until it returns to the Low Voltage Reconnect Voltage (setting item 23).' },
    { code: '135 / 234', reason: 'Battery over voltage.', solution: 'Turn off the charging inputs.' },
    { code: '33', reason: 'PV over voltage.', solution: 'Reduce the PV voltage to 30V~150V.' },
    { code: '104 / 105 / 236 / 237', reason: 'Overload.', solution: 'Reduce the use of AC output loads. Restart the machine to resume load output.' },
    { code: '106 / 123 / 238 / 239', reason: 'Heatsink over temperature.', solution: 'Reduce or disconnect the loads, then cool down the machine to normal temperature.' },
  ],
  // 48V 3500W All-in-One Solar Inverter Charger — display codes
  '48V_3500W_INVERTER_CHARGER': [
    { code: 'No Display', reason: 'Screen is off / in sleep mode.', solution: 'Check if the battery/PV breaker/fuse is ON. Press any button to exit screen sleep mode.' },
    { code: '01 / 04', reason: 'Battery under voltage.', solution: 'Charge the battery until it returns to the Low Voltage Reconnect Voltage (setting item 35).' },
    { code: '03', reason: 'Battery not detected.', solution: 'Check if the battery is connected well or if the battery circuit breaker is OFF.' },
    { code: '06', reason: 'Battery over voltage protection.', solution: 'Turn off the charging inputs.' },
    { code: '09', reason: 'PV over voltage.', solution: 'Reduce the PV voltage to 60V~145V.' },
    { code: '13 / 14', reason: 'Overload protection.', solution: 'Reduce the use of AC output loads. Restart the machine to resume load output.' },
    { code: '17', reason: 'Inverter short circuit protection.', solution: 'Check the load connection carefully and clear the short-circuit fault points. Restart to resume load output.' },
    { code: '19 / 20', reason: 'Heat sink over temperature protection.', solution: 'Cool down the machine to normal temperature.' },
    { code: '21', reason: 'Fan failure.', solution: 'Check if the fan is not turning or blocked by objects.' },
    { code: '26', reason: 'Inverter AC output backfills to bypass AC input.', solution: 'Disconnect the AC input, PV input and battery input. After the screen is off, only connect the battery and start up.' },
  ],
  // 48V 5kW Split Phase All-in-One Solar Inverter Charger — display codes
  '48V_5KW_INVERTER_CHARGER': [
    { code: 'No Display', reason: 'Screen is off / in sleep mode / switch is off.', solution: 'Check if the battery/PV breaker/fuse is ON. Press any button to exit sleep mode. Check if the product switch is ON.' },
    { code: '01 / 04', reason: 'Battery under voltage.', solution: 'Charge the battery until it returns to the Low Voltage Reconnect Voltage (setting item 35).' },
    { code: '03', reason: 'Battery not detected.', solution: 'Check if the battery is connected well or if the battery circuit breaker is OFF.' },
    { code: '06', reason: 'Battery over voltage protection.', solution: 'Turn off the charging inputs.' },
    { code: '09', reason: 'PV over voltage.', solution: 'Reduce the PV voltage to 120V~500V.' },
    { code: '13 / 14', reason: 'Overload protection.', solution: 'Reduce the use of AC output loads. Restart the machine to resume load output.' },
    { code: '17', reason: 'Inverter short circuit protection.', solution: 'Check the load connection carefully and clear the short-circuit fault points. Restart to resume load output.' },
    { code: '19 / 20', reason: 'Heat sink over temperature protection.', solution: 'Cool down the machine to normal temperature.' },
    { code: '21', reason: 'Fan failure.', solution: 'Check if the fan is not turning or blocked by objects.' },
    { code: '35', reason: 'Parallel ID (address) setting error.', solution: 'Make sure there is no duplication in the Parallel ID number settings.' },
    { code: '37', reason: 'Parallel current balancing fault.', solution: 'Check if the current balancing cable is tight and correct.' },
    { code: '39', reason: 'Inconsistent AC input source in parallel mode.', solution: 'Check whether the parallel AC inputs are from the same input interface.' },
    { code: '40 / 43', reason: 'Parallel wiring fault.', solution: 'Check if the parallel communication cable is tight and correct.' },
    { code: '42', reason: 'Inconsistent system firmware version in parallel mode.', solution: 'Check whether the software version of each solar inverter charger is consistent.' },
  ],
};

export function getErrorCodes(modelKey: string) {
  return ERROR_CODES[modelKey] ?? [];
}

export function getDevicesByBrand(brand: DeviceSpec['brand']) {
  return DEVICES.filter((d) => d.brand === brand);
}

export function getDevicesByCategory(category: DeviceSpec['category']) {
  return DEVICES.filter((d) => d.category === category);
}

export function getErrorCodeKey(device: DeviceSpec): string | null {
  if (device.category === 'solar-charge-controller') {
    if (device.type === 'MPPT') {
      if (device.specs['Rated Charging Current'] === '30A') return '30A_MPPT';
      // Redodo 40A MPPT may use similar codes — confirm with datasheet
      if (device.specs['Rated Charging Current'] === '60A') return '60A_MPPT';
      if (device.specs['Rated Charging Current'] === '100A') return '100A_MPPT';
      return null;
    }
    if (device.type === 'PWM') {
      const isWaterproof = device.features.some((f) => f.toLowerCase().includes('waterproof'));
      return isWaterproof ? '20A_PWM_WATERPROOF' : '20A_PWM';
    }
    return null;
  }

  if (device.category === 'inverter' || device.category === 'inverter-charger') {
    const model = device.model.toLowerCase();
    // LiTime inverters
    if (model.includes('1000w')) return '1000W_INVERTER';
    if (model.includes('2000w') && model.includes('ats')) return '2000W_ATS_INVERTER';
    if (model.includes('2000w')) return '2000W_INVERTER';
    if (model.includes('3000w') && device.category === 'inverter-charger') {
      if (model.includes('24v')) return '24V_3000W_INVERTER_CHARGER';
      return '3000W_INVERTER_CHARGER';
    }
    if (model.includes('3000w')) return '3000W_INVERTER';
    if (model.includes('48v') && model.includes('5kw')) return '48V_5KW_INVERTER_CHARGER';
    if (model.includes('48v') && (model.includes('3500w') || model.includes('all-in-one'))) return '48V_3500W_INVERTER_CHARGER';
    return null;
  }

  return null;
}
