import { MapStyleElement } from "react-native-maps";

export const detailedMapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#f5f5f5",
      },
    ],
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#f5f5f5",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#bdbdbd",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "poi.attraction",
    elementType: "labels.text",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "poi.business",
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "poi.business",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "poi.business",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#ffffff",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#ffffff",
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#dadada",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5",
      },
    ],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#c9c9c9",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
];

export const customMapStyle: MapStyleElement[] = [
  {
    // Set default background color
    elementType: "geometry",
    stylers: [
      {
        color: "#f3f3f3",
      },
    ],
  },
  {
    // Lighten all roads
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#f3f3f3",
      },
    ],
  },
  {
    // Lighten water areas
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#f1f3f5",
      },
    ],
  },
  {
    // Style all text to be visible on light background
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#6c757d",
      },
    ],
  },
  {
    // Remove all icons for cleaner look
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    // Lighten all land features
    featureType: "landscape",
    elementType: "geometry",
    stylers: [
      {
        color: "#f8f9fa",
      },
    ],
  },
  {
    // Lighten parks and natural features
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#f8f9fa",
      },
    ],
  },
];
