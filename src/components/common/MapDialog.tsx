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
import { Container as MapDiv, NaverMap, Marker, useNavermaps } from 'react-naver-maps';

interface MapDialogProps {
  open: boolean;
  onClose: () => void;
  onLocationSelect: (location: { lat: number; lng: number }) => void;
}

export default function MapDialog({ open, onClose, onLocationSelect }: MapDialogProps) {
  const navermaps = useNavermaps();
  
  // ✨ 1. 지도 인스턴스를 담을 ref를 생성합니다.
  const mapRef = useRef<naver.maps.Map | null>(null);
  
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

  const defaultCenter = new navermaps.LatLng(34.8118, 126.3920);

  // ✨ 2. 이벤트 타입을 'PointerEvent'로 정확하게 수정합니다.
  const handleMapClick = (e: naver.maps.PointerEvent) => {
    const { coord } = e;
    const newPos = { lat: coord.y, lng: coord.x };
    setMarkerPosition(newPos);
  };

  const handleApply = () => {
    if (markerPosition) {
      onLocationSelect(markerPosition);
    }
    onClose();
  };
  
  useEffect(() => {
    if (open) {
      setMarkerPosition(null);
    }
  }, [open]);

  // ✨ 3. useEffect를 사용해 맵이 준비되면 직접 이벤트 리스너를 등록합니다.
  useEffect(() => {
    // 맵 인스턴스가 ref에 할당되었을 때
    if (mapRef.current) {
      const map = mapRef.current;
      // 클릭 이벤트 리스너를 등록합니다.
      const listener = naver.maps.Event.addListener(map, 'click', handleMapClick);

      // 컴포넌트가 언마운트되거나, 다이얼로그가 닫힐 때 이벤트 리스너를 정리합니다.
      return () => {
        naver.maps.Event.removeListener(listener);
      };
    }
  }, [mapRef.current]); // mapRef.current가 변경될 때마다 이 효과를 실행합니다.

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>지도에서 위치 선택</DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', height: '60vh' }}>
          <MapDiv style={{ width: '100%', height: '100%' }}>
            {/* ✨ 4. NaverMap 컴포넌트에서 onClick prop을 제거하고, 대신 ref를 전달합니다. */}
            <NaverMap
              ref={mapRef}
              defaultCenter={defaultCenter} 
              defaultZoom={15} 
            >
              {markerPosition && <Marker position={markerPosition} />}
            </NaverMap>
          </MapDiv>
        </Box>
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