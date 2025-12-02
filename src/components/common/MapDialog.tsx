'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '60vh',
  minHeight: '400px',
};

// 기본 중심 좌표 (값이 없을 때 사용 - 목포)
const defaultCenter = {
  lat: 34.8118,
  lng: 126.3920,
};

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = [];

interface MapDialogProps {
  open: boolean;
  onClose: () => void;
  
  // [기존 유지] 기존 컴포넌트 호환용 (객체 전달)
  onLocationSelect?: (location: { lat: number; lng: number }) => void;

  // [신규 추가] HintSettingsTab 등에서 사용 (개별 인자 전달)
  onSelect?: (lat: number, lng: number) => void;
  
  // [신규 추가] 수정 모드일 때 초기 마커 위치
  initialLat?: number;
  initialLng?: number;
}

export default function MapDialog({ 
  open, 
  onClose, 
  onLocationSelect, 
  onSelect, 
  initialLat, 
  initialLng 
}: MapDialogProps) {
  
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || "",
    libraries: libraries,
    language: 'ko',
    region: 'KR',
  });

  // [로직 추가] 다이얼로그가 열리거나 초기값이 바뀔 때 마커/중심 설정
  useEffect(() => {
    if (open) {
      // 1. 초기 위치값이 있는 경우 (수정 모드)
      if (initialLat && initialLng) {
        const initialPos = { lat: initialLat, lng: initialLng };
        setMarkerPosition(initialPos);
        
        // 지도가 이미 로드되어 있다면 중심 이동
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(initialPos);
          mapInstanceRef.current.setZoom(17); // 상세 위치 확인을 위해 줌 인
        }
      } 
      // 2. 초기 위치값이 없는 경우 (신규 등록 모드 - 기존 동작 유지)
      else {
        setMarkerPosition(null);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(defaultCenter);
          mapInstanceRef.current.setZoom(15);
        }
      }
    }
  }, [open, initialLat, initialLng]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setMarkerPosition(newPos);
    }
  };

  const onMapLoad = (map: google.maps.Map) => {
    mapInstanceRef.current = map;
    // 로드 시점에 초기값이 있으면 그곳으로, 없으면 기본값으로
    if (initialLat && initialLng) {
      map.setCenter({ lat: initialLat, lng: initialLng });
    } else {
      map.setCenter(defaultCenter);
    }
  };

  const onMapUnmount = () => {
    mapInstanceRef.current = null;
  };

  // 리사이즈 트리거 (다이얼로그 렌더링 이슈 방지)
  const handleResize = () => {
    if (isLoaded && mapInstanceRef.current) {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          google.maps.event.trigger(mapInstanceRef.current, 'resize');
          // 리사이즈 후 중심 재설정 (마커가 있으면 마커로, 없으면 초기값/기본값)
          const center = markerPosition || (initialLat && initialLng ? { lat: initialLat, lng: initialLng } : defaultCenter);
          mapInstanceRef.current.setCenter(center);
        }
      }, 300);
    }
  };

  const handleApply = () => {
    if (markerPosition) {
      // 1. 기존 방식 지원 (onLocationSelect가 있으면 호출)
      if (onLocationSelect) {
        onLocationSelect(markerPosition);
      }
      
      // 2. 신규 방식 지원 (onSelect가 있으면 호출)
      if (onSelect) {
        onSelect(markerPosition.lat, markerPosition.lng);
      }
    }
    onClose();
  };

  const handleClose = () => {
    setMarkerPosition(null);
    onClose();
  };

  const renderMapContent = () => {
    if (!apiKey) {
      return (
        <Box sx={containerStyle}>
          지도를 불러오는 중 오류가 발생했습니다. 환경변수(NEXT_PUBLIC_GOOGLE_MAPS_KEY)를 확인해 주세요.
        </Box>
      );
    }
    if (!isLoaded) {
      return (
        <Box sx={{ ...containerStyle, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          지도 로딩 중...
        </Box>
      );
    }
    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter} // 초기 로드용, 실제는 onLoad/useEffect에서 제어
        zoom={15}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
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
        onEntered: handleResize,
      }}
    >
      <DialogTitle>지도에서 위치 선택</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {renderMapContent()}
        <Box sx={{ mt: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
          * 지도를 클릭하여 정답 위치를 선택하세요.
        </Box>
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