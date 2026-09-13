export interface IPCalculationResult {
  ipAddress: string;
  cidr: number;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
  totalHosts: number;
  usableHosts: number;
  ipClass: string;
  binarySubnetMask: string;
  binaryNetworkAddress: string;
}

export function ipToLong(ip: string): number {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    throw new Error("Invalid IPv4 address");
  }
  return (
    ((parts[0]! << 24) |
      (parts[1]! << 16) |
      (parts[2]! << 8) |
      parts[3]!) >>>
    0
  );
}

export function longToIp(long: number): string {
  return [
    (long >>> 24) & 0xff,
    (long >>> 16) & 0xff,
    (long >>> 8) & 0xff,
    long & 0xff,
  ].join(".");
}

export function longToBinary(long: number): string {
  return long
    .toString(2)
    .padStart(32, "0")
    .match(/.{8}/g)!
    .join(".");
}

export function detectIpClass(firstOctet: number): string {
  if (firstOctet >= 1 && firstOctet <= 126) return "A";
  if (firstOctet === 127) return "Loopback";
  if (firstOctet >= 128 && firstOctet <= 191) return "B";
  if (firstOctet >= 192 && firstOctet <= 223) return "C";
  if (firstOctet >= 224 && firstOctet <= 239) return "D (Multicast)";
  if (firstOctet >= 240 && firstOctet <= 255) return "E (Experimental)";
  return "Unknown";
}

export function calculateSubnet(ip: string, cidr: number): IPCalculationResult {
  if (cidr < 0 || cidr > 32 || !Number.isInteger(cidr)) {
    throw new Error("CIDR must be an integer between 0 and 32");
  }

  const ipLong = ipToLong(ip);
  const maskLong = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const wildcardLong = ~maskLong >>> 0;
  const networkLong = (ipLong & maskLong) >>> 0;
  const broadcastLong = (ipLong | wildcardLong) >>> 0;

  let firstUsableLong: number;
  let lastUsableLong: number;
  let usableHosts: number;

  if (cidr === 32) {
    firstUsableLong = ipLong;
    lastUsableLong = ipLong;
    usableHosts = 1;
  } else if (cidr === 31) {
    firstUsableLong = networkLong;
    lastUsableLong = broadcastLong;
    usableHosts = 2;
  } else {
    firstUsableLong = (networkLong + 1) >>> 0;
    lastUsableLong = (broadcastLong - 1) >>> 0;
    usableHosts = Math.max(0, Math.pow(2, 32 - cidr) - 2);
  }

  const totalHosts = Math.pow(2, 32 - cidr);
  const firstOctet = (ipLong >>> 24) & 0xff;

  return {
    ipAddress: ip,
    cidr,
    subnetMask: longToIp(maskLong),
    wildcardMask: longToIp(wildcardLong),
    networkAddress: longToIp(networkLong),
    broadcastAddress: longToIp(broadcastLong),
    firstUsableIp: longToIp(firstUsableLong),
    lastUsableIp: longToIp(lastUsableLong),
    totalHosts,
    usableHosts,
    ipClass: detectIpClass(firstOctet),
    binarySubnetMask: longToBinary(maskLong),
    binaryNetworkAddress: longToBinary(networkLong),
  };
}

export function validateIp(ip: string): boolean {
  if (!ip || typeof ip !== "string") return false;
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    const num = Number(part);
    return part !== "" && !isNaN(num) && num >= 0 && num <= 255 && String(num) === part;
  });
}
