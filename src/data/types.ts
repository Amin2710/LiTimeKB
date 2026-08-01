// Shared data types for Litime KB

export interface KBEntry {
  sub: string;
  issue: string;
  summary: string;
  template: string;
  note: string;
  link: string;
}
export type KBData = Record<string, KBEntry[]>;

export interface EmailEntry {
  issue: string;
  template: string;
  note: string;
}
export type EmailData = Record<string, EmailEntry[]>;

export interface OrientRecord {
  sku: string;
  rule: string;
  detail: string;
  kind: string;
  screw: string;
}

// Ship fees are [model, fee] tuples per region
export type ShipFee = [string, number];
export type ShipData = Record<string, ShipFee[]>;

export type IconMap = Record<string, string>;

export interface CaseRecord {
  id: string;
  user_id: string;
  order_number: string;
  email: string;
  platform: string;
  type: string;
  note: string;
  stage: string;
  stage_since: number;
  created: number;
  history: string[];
}

export interface UserPreferences {
  user_id: string;
  theme: 'dark' | 'light';
}
