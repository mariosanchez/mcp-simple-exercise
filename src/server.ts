import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {CallToolResult} from "@modelcontextprotocol/sdk/types.js";
import {z} from "zod";
import WeatherHttpDataClient from "./weatherDataClient.js";
import {Alert, Forecast, WeatherDataClient} from "./types.js";

export function setUpServer({weatherDataClient = WeatherHttpDataClient()}: { weatherDataClient?: WeatherDataClient }) {
    const server = new McpServer({
        name: "weather",
        version: "1.0.0",
        description: "A simple weather app that uses the National Weather Service API",
        capabilities: {
            resources: {},
            tools: {},
        }
    });

    server.tool(
        "get-alerts",
        "Get weather alerts for a state",
        {
            state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
        },
        async ({state}) => {
            const stateCode = state.toUpperCase();
            const {data: alerts} = await weatherDataClient.getAlerts(stateCode)

            if (alerts.length === 0) {
                return textResponse(("No active alerts for " + stateCode));
            }

            return textResponse(`Active alerts for ${stateCode}:\n\n${formatAlerts(alerts)}`);
        }
    )

    server.tool(
        "get-forecast",
        "Get weather forecast for a coordinate",
        {
            latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
            longitude: z
                .number()
                .min(-180)
                .max(180)
                .describe("Longitude of the location"),
        },
        async ({latitude, longitude}) => {
            const {data: forecast} = await weatherDataClient.getForecast({latitude, longitude});

            if (forecast.length === 0) {
                return textResponse("No forecast data available for the specified location.");
            }

            return textResponse(`Weather forecast for (${latitude}, ${longitude}):\n\n${formatForecasts(forecast)}`);
        }
    );

    return server
}

function formatAlerts(alerts: Alert[]) {
    return alerts.map(alert => {
        const props = alert;
        return [
          `Event: ${props.event || "Unknown"}`,
          `Area: ${props.areaDescription || "Unknown"}`,
          `Severity: ${props.severity || "Unknown"}`,
          `Status: ${props.status || "Unknown"}`,
          `Headline: ${props.headline || "No headline"}`,
          "---",
        ].join("\n");
    }).join("\n")
}

function formatForecasts(forecasts: Forecast[]) { 
    return (forecasts.map((period: Forecast) =>
    [
      `${period.name || "Unknown"}:`,
      `Temperature: ${period.temperature || "Unknown"}°${period.temperatureUnit || "F"}`,
      `Wind: ${period.windSpeed || "Unknown"} ${period.windDirection || ""}`,
      `${period.shortForecast || "No forecast available"}`,
      "---",
    ].join("\n"),
  ))
  .join("\n");
}

function textResponse(alertsText: string): CallToolResult {
    return {
        content: [
            {
                type: "text",
                text: alertsText,
            },
        ],
    }
}