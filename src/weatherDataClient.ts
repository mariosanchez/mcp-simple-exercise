import { WeatherDataClient } from "./types.js";

export default function WeatherHttpDataClient(): WeatherDataClient {
    return {
        getAlerts: () => {
            return {
                data: []
            }
        },

        getForecast: () => {
            return {
                data: []
            }
        }
    }
}