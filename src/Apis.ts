import { DestinationResponse, SearchData } from "./Types";

const API_BASE_URL = "http://localhost:8080/api/";
const FORMAT_QUERY = "format=json";
const SEARCHDATA_URL = `${API_BASE_URL}search-data?${FORMAT_QUERY}`;
const DESTINATION_URL = `${API_BASE_URL}destination?${FORMAT_QUERY}`;


export const saveSearchData = async (data: SearchData) => {
  const response = await fetch(SEARCHDATA_URL, {
    method: "POST",
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify(data)
  })

  return response.json()
}

export const getDestinationInfo = async (): Promise<DestinationResponse> => {
  const response = await fetch(DESTINATION_URL, {
    method: "GET",
    headers: {'Content-Type': 'application/json'},
  })

  return response.json();
}