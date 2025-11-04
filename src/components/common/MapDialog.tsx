'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// 지도 컨테이너 스타일 (기존 sx와 동일하게 맞춤)
const containerStyle = {
  width: '100%',
  height: '60vh',
  minHeight: '400px',
};

// 네이버 지도에서 사용했던 초기 중심 좌표
const initialCenter = {
  lat: 34.8118,
  lng: 126.3920,
};

// Google Maps API에서 사용할 라이브러리 (필요시 'places' 등 추가)
const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = [];

// Props 인터페이스는 기존과 동일
interface MapDialogProps {
  open: boolean;
  onClose: () => void;
  onLocationSelect: (location: { lat: number; lng: number }) => void;
}

export default function MapDialog({ open, onClose, onLocationSelect }: MapDialogProps) {
  // 마커 위치 상태 (기존과 동일)
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  
  // 지도 인스턴스 참조 (리사이징을 위해)
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || "",
    libraries: libraries,
    language: 'ko',
    region: 'KR',
  });

  // 2. 지도 클릭 핸들러
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setMarkerPosition(newPos);
    }
  };

  // 3. 지도 로드 시 인스턴스 저장
  const onMapLoad = (map: google.maps.Map) => {
    mapInstanceRef.current = map;
    map.setCenter(initialCenter); // 로드 완료 후 중앙 설정
  };

  // 4. 지도 언마운트 시 인스턴스 정리
  const onMapUnmount = () => {
    mapInstanceRef.current = null;
  };

  // 5. 다이얼로그가 완전히 열린 후 지도 리사이즈 (중요)
  // (기존 Naver Map 코드와 동일한 원리)
  const handleResize = () => {
    if (isLoaded && mapInstanceRef.current) {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          google.maps.event.trigger(mapInstanceRef.current, 'resize');
          mapInstanceRef.current.setCenter(initialCenter);
        }
      }, 300); // 300ms 지연 (기존과 동일)
    }
  };

  // 6. 적용하기 핸들러 (기존과 동일)
  const handleApply = () => {
    if (markerPosition) {
      onLocationSelect(markerPosition);
    }
    setMarkerPosition(null); // 상태 초기화
    onClose();
  };

  // 7. 취소 핸들러 (상태 초기화 추가)
  const handleClose = () => {
    setMarkerPosition(null); // 상태 초기화
    onClose();
  };

  // 8. 로딩 및 에러 처리
  const renderMapContent = () => {
    if (!apiKey) {
      return (
        <Box sx={containerStyle}>
          지도를 불러오는 중 오류가 발생했습니다. API 키를 확인해 주세요.
        </Box>
      );
    }
    if (!isLoaded) {
      return (
        <Box sx={{ ...containerStyle, backgroundColor: '#e5e3df' }}>
          지도 로딩 중...
        </Box>
      );
    }
    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={initialCenter}
        zoom={15}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        onClick={handleMapClick}
      >
        {/* markerPosition 상태에 따라 마커를 선언적으로 렌더링 */}
        {markerPosition && (
          <Marker position={markerPosition} />
        )}
      </GoogleMap>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      TransitionProps={{
        onEntered: handleResize, // 다이얼로그가 열린 후 리사이즈 실행
      }}
    >
      <DialogTitle>지도에서 위치 선택</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {renderMapContent()}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button onClick={handleApply} variant="contained" disabled={!markerPosition}>
          적용하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}