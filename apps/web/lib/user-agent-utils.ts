export interface ParsedUserAgent {
  browser: string;
  os: string;
  deviceType: string;
}

export function parseUserAgent(userAgent?: string): ParsedUserAgent {
  if (!userAgent) {
    return {
      browser: "Unknown",
      os: "Unknown",
      deviceType: "Unknown",
    };
  }

  // Parse browser
  let browser = "Unknown";
  if (userAgent.includes("Firefox") && !userAgent.includes("Seamonkey")) {
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
    browser = match ? `Firefox ${match[1]}` : "Firefox";
  } else if (userAgent.includes("Edg/")) {
    const match = userAgent.match(/Edg\/(\d+\.\d+)/);
    browser = match ? `Edge ${match[1]}` : "Edge";
  } else if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
    browser = match ? `Chrome ${match[1]}` : "Chrome";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    const match = userAgent.match(/Version\/(\d+\.\d+)/);
    browser = match ? `Safari ${match[1]}` : "Safari";
  } else if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) {
    browser = "Internet Explorer";
  }

  // Parse OS
  let os = "Unknown";
  if (userAgent.includes("Windows NT 10.0")) {
    os = "Windows 10/11";
  } else if (userAgent.includes("Windows NT 6.3")) {
    os = "Windows 8.1";
  } else if (userAgent.includes("Windows NT 6.2")) {
    os = "Windows 8";
  } else if (userAgent.includes("Windows NT 6.1")) {
    os = "Windows 7";
  } else if (userAgent.includes("Windows")) {
    os = "Windows";
  } else if (userAgent.includes("Mac OS X")) {
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
    if (match) {
      const version = match[1].replace(/_/g, ".");
      os = `macOS ${version}`;
    } else {
      os = "macOS";
    }
  } else if (userAgent.includes("Android")) {
    const match = userAgent.match(/Android (\d+(\.\d+)?)/);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (userAgent.includes("Linux")) {
    os = "Linux";
  } else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    const match = userAgent.match(/OS (\d+_\d+)/);
    if (match) {
      const version = match[1].replace(/_/g, ".");
      os = `iOS ${version}`;
    } else {
      os = "iOS";
    }
  }

  // Parse device type
  let deviceType = "Desktop";
  if (userAgent.includes("Mobile") || userAgent.includes("Android")) {
    deviceType = "Mobile";
  } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
    deviceType = "Tablet";
  }

  return {
    browser,
    os,
    deviceType,
  };
}
