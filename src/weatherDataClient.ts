import { Alert, GetAlertsResponse, WeatherDataClient } from "./types.js";

const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

const headers = {
  "User-Agent": USER_AGENT,
  Accept: "application/geo+json",
};

interface AlertFeature {
  properties: {
    event?: string;
    areaDesc?: string;
    severity?: string;
    status?: string;
    headline?: string;
  };
}

interface AlertsResponse {
  features: AlertFeature[];
}



export default function WeatherHttpDataClient(): WeatherDataClient {
  return {
    getAlerts: async (stateCode: string) => {
      const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
      const alertsData = await makeNWSRequest<AlertsResponse>(alertsUrl);

      if (!alertsData) {
        throw new Error("Failed to fetch alerts");
      }

      const alerts = mapFetchedDataToAlert(alertsData);

      return {
        data: alerts,
      };
    },

    getForecast: async () => {
      return {
        data: [],
      };
    },
  };
}

function mapFetchedDataToAlert(alertsData: AlertsResponse): Alert[] {
  return alertsData.features.map((feature) => ({
    event: feature.properties.event || "",
    areaDescription: feature.properties.areaDesc || "",
    severity: feature.properties.severity || "",
    status: feature.properties.status || "",
    headline: feature.properties.headline || "",
  }));
}

async function makeNWSRequest<T>(url: string): Promise<T | null> {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/geo+json",
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making NWS request:", error);
    return null;
  }
}
