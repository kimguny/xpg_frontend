'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { useCreateNotification } from '@/hooks/mutation/useCreateNotification';
import { useUpdateNotification } from '@/hooks/mutation/useUpdateNotification';
import { useGetNotificationById } from '@/hooks/query/useGetNotificationById';
import { NotificationCreatePayload, NotificationUpdatePayload } from '@/lib/api/admin';

// 폼 데이터 타입
type NotificationFormData = {
  title: string;
  notification_type: 'system' | 'event' | 'promotion';
  start_at: string;
  end_at: string;
  content: string;
  show_popup_on_app_start: boolean;
  is_draft: boolean;
};

// Props 인터페이스
interface NotificationRegisterFormProps {
  mode: 'register' | 'edit';
  notificationId?: string;
}

export default function NotificationRegisterForm({ mode, notificationId }: NotificationRegisterFormProps) {
  const router = useRouter();
  const isEditMode = mode === 'edit';

  // 데이터 페칭 및 뮤테이션 훅
  const { data: existingData, isLoading: isLoadingData } = useGetNotificationById(notificationId || '');
  const createNotificationMutation = useCreateNotification();
  const updateNotificationMutation = useUpdateNotification();

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<NotificationFormData>({
    defaultValues: {
      title: '',
      notification_type: 'system',
      start_at: '',
      end_at: '',
      content: '',
      show_popup_on_app_start: false,
      is_draft: false,
    },
  });

  const contentValue = watch('content');

  // 수정 모드 데이터 로드
  useEffect(() => {
    if (isEditMode && existingData) {
      const formatDateTime = (dateString: string) => {
        try {
          const date = new Date(dateString);
          // 로컬 시간으로 변환 (datetime-local input은 로컬 시간 사용)
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (e) {
          return '';
        }
      };

      const formData: NotificationFormData = {
        title: existingData.title,
        notification_type: existingData.notification_type,
        start_at: formatDateTime(existingData.start_at),
        end_at: formatDateTime(existingData.end_at),
        content: existingData.content,
        show_popup_on_app_start: existingData.show_popup_on_app_start,
        is_draft: existingData.status === 'draft',
      };
      reset(formData);
    }
  }, [isEditMode, existingData, reset]);

  // 폼 제출 핸들러
  const onSubmit: SubmitHandler<NotificationFormData> = (data) => {
    const payload: NotificationCreatePayload | NotificationUpdatePayload = {
      title: data.title,
      content: data.content,
      notification_type: data.notification_type,
      start_at: new Date(data.start_at).toISOString(),
      end_at: new Date(data.end_at).toISOString(),
      show_popup_on_app_start: data.show_popup_on_app_start,
      is_draft: data.is_draft,
    };

    if (isEditMode && notificationId) {
      updateNotificationMutation.mutate({ 
        notificationId, 
        payload: payload as NotificationUpdatePayload 
      });
    } else {
      createNotificationMutation.mutate(payload as NotificationCreatePayload);
    }
  };

  const isLoading = createNotificationMutation.isPending || updateNotificationMutation.isPending;
  const title = isEditMode ? '공지사항 수정' : '공지사항 등록';
  const buttonText = isEditMode ? '수정하기' : '등록';

  if (isEditMode && isLoadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        {title}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* 제목 */}
            <Controller
              name="title"
              control={control}
              rules={{ 
                required: '제목은 필수입니다.',
                maxLength: { value: 200, message: '제목은 200자 이내로 입력해주세요.' }
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="제목 *"
                  placeholder="공지사항 제목을 입력하세요"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            {/* 공지 유형 */}
            <FormControl component="fieldset">
              <FormLabel component="legend">공지 유형 *</FormLabel>
              <Controller
                name="notification_type"
                control={control}
                render={({ field }) => (
                  <RadioGroup {...field} row>
                    <FormControlLabel value="system" control={<Radio />} label="시스템 공지" />
                    <FormControlLabel value="event" control={<Radio />} label="이벤트 공지" />
                    <FormControlLabel value="promotion" control={<Radio />} label="프로모션" />
                  </RadioGroup>
                )}
              />
            </FormControl>

            {/* 시작일 / 종료일 */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                게시 기간 *
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Controller
                  name="start_at"
                  control={control}
                  rules={{ required: '시작일은 필수입니다.' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="datetime-local"
                      sx={{ flex: 1 }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
                <Typography>~</Typography>
                <Controller
                  name="end_at"
                  control={control}
                  rules={{ 
                    required: '종료일은 필수입니다.',
                    validate: (value, formValues) => {
                      if (new Date(value) <= new Date(formValues.start_at)) {
                        return '종료일은 시작일보다 이후여야 합니다.';
                      }
                      return true;
                    }
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="datetime-local"
                      sx={{ flex: 1 }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Box>
            </Box>

            {/* 내용 */}
            <Controller
              name="content"
              control={control}
              rules={{ 
                required: '내용은 필수입니다.',
                maxLength: { value: 500, message: '내용은 500자 이내로 입력해주세요.' }
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="내용 *"
                  multiline
                  rows={6}
                  placeholder="공지사항 내용을 입력하세요"
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message || 
                    `${contentValue?.length || 0}/500`
                  }
                  fullWidth
                />
              )}
            />

            {/* 앱 시작 시 팝업 표시 */}
            <Controller
              name="show_popup_on_app_start"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="앱 시작 시 매번 화면에 팝업으로 표시"
                />
              )}
            />

          </Box>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => {
              // 포커스 해제하여 달력 값 확정
              (document.activeElement as HTMLElement)?.blur();
              setTimeout(() => {
                setValue('is_draft', true);
                handleSubmit(onSubmit)();
              }, 100);
            }}
            disabled={isLoading}
          >
            임시 저장
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push('/save/notifications/manage')}
          >
            취소
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              // 포커스 해제하여 달력 값 확정
              (document.activeElement as HTMLElement)?.blur();
              setTimeout(() => {
                setValue('is_draft', false);
                handleSubmit(onSubmit)();
              }, 100);
            }}
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : buttonText}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}