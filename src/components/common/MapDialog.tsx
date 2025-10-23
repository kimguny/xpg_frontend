'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';

interface MapDialogProps {
  open: boolean;
  onClose: () => void;
  onLocationSelect: (location: { lat: number; lng: number }) => void;
}

export default function MapDialog({ open, onClose, onLocationSelect }: MapDialogProps) {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<naver.maps.Map | null>(null);
  const markerInstance = useRef<naver.maps.Marker | null>(null);
  const eventListener = useRef<naver.maps.MapEventListener | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (open && mapElement.current) {
      // 네이버 지도 스크립트 로드 대기
      const initMap = () => {
        if (!window.naver || !window.naver.maps) {
          setTimeout(initMap, 100);
          return;
        }

        if (!mapElement.current) return;

        // 이미 지도가 생성되었다면 리사이즈만 수행
        if (mapInstance.current) {
          setTimeout(() => {
            if (mapInstance.current) {
              window.naver.maps.Event.trigger(mapInstance.current, 'resize');
              mapInstance.current.setCenter(new window.naver.maps.LatLng(34.8118, 126.3920));
            }
          }, 300); // 300ms로 증가
          return;
        }

        // 지도 생성
        const mapOptions: naver.maps.MapOptions = {
          center: new window.naver.maps.LatLng(34.8118, 126.3920),
          zoom: 15,
        };

        mapInstance.current = new window.naver.maps.Map(mapElement.current, mapOptions);

        // 클릭 이벤트 리스너
        eventListener.current = window.naver.maps.Event.addListener(
          mapInstance.current,
          'click',
          (e: naver.maps.PointerEvent) => {
            const newPos = { lat: e.coord.y, lng: e.coord.x };
            setMarkerPosition(newPos);

            if (markerInstance.current) {
              markerInstance.current.setPosition(e.coord);
            } else {
              markerInstance.current = new window.naver.maps.Marker({
                position: e.coord,
                map: mapInstance.current,
              });
            }
          }
        );
      };

      // Dialog 열림 애니메이션 후 지도 초기화
      setTimeout(initMap, 200);
    }

    // Dialog가 닫힐 때 마커 위치 초기화
    if (!open) {
      setMarkerPosition(null);
      if (markerInstance.current) {
        markerInstance.current.setMap(null);
        markerInstance.current = null;
      }
    }
  }, [open]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (eventListener.current) {
        eventListener.current.remove();
      }
      if (markerInstance.current) {
        markerInstance.current.setMap(null);
      }
    };
  }, []);

  const handleApply = () => {
    if (markerPosition) {
      onLocationSelect(markerPosition);
    }
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      // Dialog가 열릴 때 지도 크기 재조정
      TransitionProps={{
        onEntered: () => {
          if (mapInstance.current && window.naver) {
            setTimeout(() => {
              window.naver.maps.Event.trigger(mapInstance.current!, 'resize');
            }, 300); // 100ms에서 300ms로 증가
          }
        }
      }}
    >
      <DialogTitle>지도에서 위치 선택</DialogTitle>
      <DialogContent sx={{ pt: 2 }}> {/* padding-top 추가 */}
        <Box 
          ref={mapElement} 
          sx={{ 
            width: '100%', 
            height: '60vh',
            minHeight: '400px',
            backgroundColor: '#e5e3df', // 지도 로딩 중 배경색
          }} 
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleApply} variant="contained" disabled={!markerPosition}>
          적용하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}