export type Alert = {
    event: string
    areaDescription: string
    severity: string
    status: string
    headline: string
}

export type Forecast = {
    name: string
    temperature: number
    temperatureUnit: string
    windSpeed: string
    windDirection: string
    shortForecast: string
}

export type GetAlertsResponse = {
    data: Alert[]
}

export type GetForecastResponse = {
    data: Forecast[]
}

type Coordinate = {
    latitude: number,
    longitude: number,
}

export interface WeatherDataClient { 
    getAlerts: (stateCode: string) => Promise<GetAlertsResponse>
    getForecast: (coordinate: Coordinate) => Promise<GetForecastResponse>
}
