declare namespace naver.maps {
  class LatLng {
    constructor(lat: number, lng: number);
    x: number;
    y: number;
    lat(): number;
    lng(): number;
  }

  interface MapOptions {
    center: LatLng;
    zoom: number;
    minZoom?: number;
    maxZoom?: number;
    zoomControl?: boolean;
    zoomControlOptions?: {
      position: number;
    };
  }

  class Map {
    constructor(element: HTMLElement, options: MapOptions);
    setCenter(center: LatLng): void;
    getCenter(): LatLng;
    setZoom(zoom: number): void;
    getZoom(): number;
  }

  interface MarkerOptions {
    position: LatLng;
    map: Map | null;
    icon?: string;
    title?: string;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setPosition(position: LatLng): void;
    setMap(map: Map | null): void;
    getPosition(): LatLng;
  }

  interface PointerEvent {
    coord: LatLng;
    point: { x: number; y: number };
  }

  namespace Event {
    function addListener(
      target: Map | Marker,
      eventName: string,
      listener: (event: PointerEvent) => void
    ): MapEventListener;
    function removeListener(listener: MapEventListener): void;
    function trigger(target: Map | Marker, eventName: string): void;
  }

  interface MapEventListener {
    remove(): void;
  }
}

interface Window {
  naver: {
    maps: typeof naver.maps;
  };
}