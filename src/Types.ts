export type SearchData = {
  url: string;
  data: string
}

export type Stats = {
  energy_sources: number
  air_quality: number
  water_quality: number
}

export type Destination = Stats & {
  content: string
  createdAt: string
  id: number
}

export type DestinationResponse = {
  destinations: Destination[],
  total: number
}