export type HubLocation = {
  name: string
  lat: number
  lng: number
}

export const HUB_LOCATIONS: HubLocation[] = [
  { name: "Mumbai Distribution Hub", lat: 19.076, lng: 72.8777 },
  { name: "Pune Logistics Park", lat: 18.5204, lng: 73.8567 },
  { name: "Nagpur Warehouse", lat: 21.1458, lng: 79.0882 },
  { name: "Delhi NCR Warehouse", lat: 28.6139, lng: 77.209 },
  { name: "Bengaluru Cargo Depot", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai Freight Terminal", lat: 13.0827, lng: 80.2707 },
  { name: "Coimbatore Regional Depot", lat: 11.0168, lng: 76.9558 },
  { name: "Kolkata Regional Depot", lat: 22.5726, lng: 88.3639 },
  { name: "Hyderabad Distribution Hub", lat: 17.385, lng: 78.4867 },
  { name: "Ahmedabad Logistics Park", lat: 23.0225, lng: 72.5714 },
  { name: "Surat Logistics Park", lat: 21.1702, lng: 72.8311 },
  { name: "Jaipur Warehouse", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow Regional Depot", lat: 26.8467, lng: 80.9462 },
  { name: "Chandigarh Cargo Depot", lat: 30.7333, lng: 76.7794 },
  { name: "Ludhiana Cargo Depot", lat: 30.901, lng: 75.8573 },
  { name: "Kochi Freight Terminal", lat: 9.9312, lng: 76.2673 },
  { name: "Thiruvananthapuram Freight Terminal", lat: 8.5241, lng: 76.9366 },
  { name: "Patna Distribution Hub", lat: 25.5941, lng: 85.1376 },
]

export const INDIA_MAP_CENTER: [number, number] = [22.5, 80]
export const INDIA_MAP_DEFAULT_ZOOM = 4.5
