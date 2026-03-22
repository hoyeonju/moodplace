"use client";

import { useEffect, useRef, useState } from "react";
import type { Place } from "@/lib/types";

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (
          container: HTMLElement,
          options: { center: unknown; level: number }
        ) => KakaoMapInstance;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: { map: KakaoMapInstance; position: unknown }) => KakaoMarker;
        InfoWindow: new (options: {
          content: string;
          removable?: boolean;
        }) => KakaoInfoWindow;
        event: {
          addListener: (
            target: unknown,
            event: string,
            callback: () => void
          ) => void;
        };
      };
    };
  }
}

interface KakaoMapInstance {
  setCenter: (latlng: unknown) => void;
}

interface KakaoMarker {
  setMap: (map: KakaoMapInstance | null) => void;
}

interface KakaoInfoWindow {
  open: (map: KakaoMapInstance, marker: KakaoMarker) => void;
  close: () => void;
}

interface KakaoMapProps {
  centerLat: number;
  centerLng: number;
  places: Place[];
  onMarkerClick?: (place: Place) => void;
}

export default function KakaoMap({
  centerLat,
  centerLng,
  places,
  onMarkerClick,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      try {
        if (!window.kakao?.maps) {
          setMapError(true);
          return;
        }

        window.kakao.maps.load(() => {
          if (!mapRef.current) return;

          const center = new window.kakao.maps.LatLng(centerLat, centerLng);
          const map = new window.kakao.maps.Map(mapRef.current, {
            center,
            level: 5,
          });

          let activeInfoWindow: KakaoInfoWindow | null = null;

          places.forEach((place) => {
            const position = new window.kakao.maps.LatLng(
              place.lat,
              place.lng
            );
            const marker = new window.kakao.maps.Marker({
              map,
              position,
            });

            const infoContent = `
              <div style="padding:8px 12px;font-size:13px;min-width:120px;">
                <strong>${place.name}</strong>
                <br/>
                <span style="color:#666;font-size:11px;">${place.category}</span>
              </div>
            `;

            const infoWindow = new window.kakao.maps.InfoWindow({
              content: infoContent,
              removable: true,
            });

            window.kakao.maps.event.addListener(marker, "click", () => {
              if (activeInfoWindow) activeInfoWindow.close();
              infoWindow.open(map, marker);
              activeInfoWindow = infoWindow;
              onMarkerClick?.(place);
            });
          });
        });
      } catch {
        setMapError(true);
      }
    };

    // 카카오맵 SDK 로드 대기
    const checkKakao = setInterval(() => {
      if (window.kakao?.maps) {
        clearInterval(checkKakao);
        initMap();
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(checkKakao);
      if (!window.kakao?.maps) setMapError(true);
    }, 5000);

    return () => {
      clearInterval(checkKakao);
      clearTimeout(timeout);
    };
  }, [centerLat, centerLng, places, onMarkerClick]);

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-500 text-sm">
        지도를 불러올 수 없어요. 리스트 뷰로 확인해주세요.
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
}
