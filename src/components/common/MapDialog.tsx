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
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (open && mapElement.current && window.naver && window.naver.maps) {
      setMarkerPosition(null);

      // ✨ setTimeout으로 지도 생성을 약간 지연시켜 렌더링 타이밍 문제를 해결합니다.
      const timer = setTimeout(() => {
        if (!mapElement.current) return;

        const mapOptions: naver.maps.MapOptions = {
          center: new window.naver.maps.LatLng(34.8118, 126.3920),
          zoom: 15,
        };
        const map = new window.naver.maps.Map(mapElement.current, mapOptions);
        let marker: naver.maps.Marker | null = null;

        const listener = window.naver.maps.Event.addListener(map, 'click', (e: naver.maps.PointerEvent) => {
          const newPos = { lat: e.coord.y, lng: e.coord.x };
          setMarkerPosition(newPos);
          if (marker) {
            marker.setPosition(newPos);
          } else {
            marker = new window.naver.maps.Marker({
              position: newPos,
              map: map,
            });
          }
        });

        // 다이얼로그가 닫힐 때 이벤트 리스너를 정리하기 위한 로직
        // (이 부분은 setTimeout 스코프 밖의 클린업 함수로 관리하는 것이 더 안정적입니다.)
      }, 100); // 0.1초 지연

      // 클린업 함수: 다이얼로그가 닫히거나 재렌더링 시 타이머를 제거합니다.
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleApply = () => {
    if (markerPosition) {
      onLocationSelect(markerPosition);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>지도에서 위치 선택</DialogTitle>
      <DialogContent>
        <Box ref={mapElement} sx={{ width: '100%', height: '60vh' }} />
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