export type Alert = {
    event: string
    areaDescription: string
    severity: string
    status: string
    headline: string
}

export type ForecastPeriod = {
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
    data: ForecastPeriod[]
}

export interface WeatherDataClient { 
    getAlerts: (stateCode: string) => Promise<GetAlertsResponse>
    getForecast: () => Promise<GetForecastResponse>
}
