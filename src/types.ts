export type AppTab =
  | 'quick_optimizer'
  | 'sub_link_gen'
  | 'gaming_live_ping'
  | 'ip_scanner'
  | 'database_manager'
  | 'doh_lab'
  | 'fragment_lab'
  | 'converter'
  | 'batch_sub'
  | 'node_doctor'
  | 'toolkit';

export type Language = 'fa' | 'en';
export type Theme = 'dark' | 'light';

export interface ProxyChainSettings {
  enabled: boolean;
  type: 'socks5' | 'http' | 'proxyip';
  server: string;
  port: number;
  username?: string;
  password?: string;
  proxyIp?: string;
  label?: string;
}

export interface ParsedProxyConfig {
  id: string;
  protocol: 'vless' | 'trojan' | 'vmess' | 'ss' | 'hysteria2' | 'tuic' | 'wireguard' | 'unknown';
  uuid: string;
  server: string;
  port: number;
  name: string;
  transport: 'ws' | 'grpc' | 'httpupgrade' | 'tcp' | 'h2' | 'quic';
  security: 'tls' | 'reality' | 'none';
  sni: string;
  host: string;
  path: string;
  alpn: string;
  fingerprint: string;
  earlyData: string;
  fragmentEnabled: boolean;
  fragmentLength: string;
  fragmentInterval: string;
  fragmentPackets: string;
  noiseEnabled?: boolean;
  noiseCount?: string;
  noiseMinLength?: string;
  noiseMaxLength?: string;
  proxyIp?: string;
  chain?: ProxyChainSettings;
  createdAt?: string;
  raw: string;
}

export interface CleanIpItem {
  ip: string;
  port: number;
  operator: 'mci' | 'mtn' | 'rtl' | 'shatel' | 'global' | 'fastly' | 'ai_proxyip';
  label: string;
  latency: number | null;
  ttfb?: number | null;
  jitter?: number | null;
  speedMbps?: number | null;
  packetLoss?: number;
  status: 'idle' | 'testing' | 'success' | 'timeout';
}

export interface DohProvider {
  id: string;
  name: string;
  url: string;
  type: 'global' | 'anti_sanction' | 'security';
  supportsJson: boolean;
}

export interface DohQueryResult {
  domain: string;
  provider: string;
  status: number;
  ips: string[];
  ttl: number;
  durationMs: number;
}

export interface GeoIpInfo {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  isp: string;
  org: string;
  asn: string;
  colo?: string;
}

export interface SavedSubscriptionRecord {
  id: string;
  title: string;
  url: string;
  gistId?: string;
  format: string;
  updateIntervalHours: number;
  configsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseBackup {
  version: string;
  timestamp: string;
  configs: ParsedProxyConfig[];
  subscriptions: SavedSubscriptionRecord[];
  cleanIps: CleanIpItem[];
  settings: Record<string, any>;
}
