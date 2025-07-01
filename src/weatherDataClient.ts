import { Alert, Forecast, GetAlertsResponse, WeatherDataClient } from "./types.js";

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

interface ForecastPeriod {
  name?: string;
  temperature?: number;
  temperatureUnit?: string;
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
}

interface ForecastResponse {
  properties: {
    periods: ForecastPeriod[];
  };
}

interface PointsResponse {
  properties: {
    forecast?: string;
  };
}


export const ERROR_FAIL_TO_FETCH_FORECAST = "Failed to fetch forecast";

export default function WeatherHttpDataClient(): WeatherDataClient {
  return {
    getAlerts: async (stateCode: string) => {
      const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
      const alertsData = await makeNWSRequest<AlertsResponse>(alertsUrl);

      if (!alertsData) {
        throw new Error(ERROR_FAILED_TO_FETCH_ALERTS());
      }

      const alerts = mapFetchedDataToAlert(alertsData);

      return {
        data: alerts,
      };
    },

    getForecast: async ({latitude, longitude}) => {
      const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
      const pointsData = await makeNWSRequest<PointsResponse>(pointsUrl);

      if (!pointsData) {
        throw new Error(ERROR_FAIL_TO_FETCH_FORECAST);
      }

      const forecastUrl = pointsData.properties?.forecast;

      if (!forecastUrl) {
        throw new Error(ERROR_FAIL_TO_FETCH_FORECAST);
      }

      const forecastData = await makeNWSRequest<ForecastResponse>(forecastUrl);

      if (!forecastData) {
        throw new Error(ERROR_FAIL_TO_FETCH_FORECAST);
      }
      
      const forecast = mapFetchedDataToForecast(forecastData);

      return {
        data: forecast,
      };
    },
  };
}

function ERROR_FAILED_TO_FETCH_ALERTS(): string | undefined {
  return "Failed to fetch alerts";
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

const ABSOLUTE_ZERO = -273.15;

function mapFetchedDataToForecast(forecastData: ForecastResponse): Forecast[] {
  return forecastData.properties.periods.map((period) => ({
    name: period.name || "",
    temperature: period.temperature || ABSOLUTE_ZERO,
    temperatureUnit: period.temperatureUnit || "",
    windSpeed: period.windSpeed || "",
    windDirection: period.windDirection || "",
    shortForecast: period.shortForecast || "",
  }));
}


const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

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
