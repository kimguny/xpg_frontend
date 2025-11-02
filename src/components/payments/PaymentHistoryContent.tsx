'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Pagination,
  TableSortLabel,
  Chip,
  Tooltip,
} from '@mui/material';
import { GetRewardLedgerParams, RewardLedgerItem } from '@/lib/api/admin';
import { useGetRewardLedger } from '@/hooks/query/useGetRewardLedger';

// 정렬 방향
type Order = 'asc' | 'desc';

// 테이블 헤더 컬럼 정의
interface HeadCell {
  id: keyof RewardLedgerItem | 'user.nickname' | 'details'; // 정렬에 사용할 키
  label: string;
  numeric: boolean;
  sortable: boolean;
}

const headCells: readonly HeadCell[] = [
  { id: 'created_at', label: '날짜', numeric: false, sortable: true },
  { id: 'user.nickname', label: '유저 (ID)', numeric: false, sortable: true }, // 'user.nickname' 정렬은 백엔드 지원 필요
  { id: 'details', label: '내용', numeric: false, sortable: false },
  { id: 'coin_delta', label: '포인트 변동', numeric: true, sortable: true },
  { id: 'note', label: '메모', numeric: false, sortable: true },
];

// 테이블 헤더 컴포넌트
interface PaymentHistoryTableHeadProps {
  order: Order;
  orderBy: string;
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
}

function PaymentHistoryTableHead(props: PaymentHistoryTableHeadProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: string) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow sx={{ bgcolor: 'grey.50' }}>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ fontWeight: 600 }}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// 결제 내역 상세 내용을 포맷팅하는 헬퍼 함수
function formatDetails(item: RewardLedgerItem): string {
  if (item.reward) {
    return `[상품] ${item.reward.product_name}`;
  }
  if (item.stage) {
    return `[스테이지] ${item.stage.title}`;
  }
  if (item.content) {
    return `[콘텐츠] ${item.content.title}`;
  }
  return '시스템 활동';
}

// 메인 컴포넌트
export default function PaymentHistoryContent() {
  // 정렬 상태
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<string>('created_at');
  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [size] = useState(10); // 페이지당 10개

  // 쿼리 파라미터 조합
  const queryParams: GetRewardLedgerParams = {
    page,
    size,
    sort: `${orderBy},${order.toUpperCase()}`,
  };

  // 훅: 데이터 조회
  const { data, isLoading, isError } = useGetRewardLedger(queryParams);

  const items = data?.items || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / size);

  // 정렬 요청 핸들러
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(1); // 정렬 시 1페이지로 리셋
  };

  // 페이지 변경 핸들러
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        결제 내역 (포인트 변동)
      </Typography>

      {/* TODO: 검색(q) 또는 유저 필터(user_id) UI 추가 공간 */}

      <Card>
        <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
          <Table>
            <PaymentHistoryTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    데이터를 불러오는 중 오류가 발생했습니다.
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    결제 내역이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow
                    key={item.id}
                    sx={{ '&:hover': { bgcolor: 'grey.50' } }}
                  >
                    <TableCell>
                      {new Date(item.created_at).toLocaleString('ko-KR')}
                    </TableCell>
                    <TableCell>
                      {item.user ? (
                        <Tooltip title={`ID: ${item.user.login_id}`}>
                          <span>{item.user.nickname || '(닉네임 없음)'}</span>
                        </Tooltip>
                      ) : (
                        '(알 수 없음)'
                      )}
                    </TableCell>
                    <TableCell>{formatDetails(item)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${
                          item.coin_delta > 0 ? '+' : ''
                        }${item.coin_delta.toLocaleString()} P`}
                        color={item.coin_delta > 0 ? 'success' : 'error'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={item.note || ''}>
                        <span>
                          {item.note
                            ? item.note.substring(0, 30) +
                              (item.note.length > 30 ? '...' : '')
                            : '-'}
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 3,
              py: 2,
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Card>
    </Box>
  );
}
