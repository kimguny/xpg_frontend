import apiClient from '@/utils/apiClient';

export interface AdminStatsResponse {
  today_consumed_count: number;
  total_consumed_count: number;
  total_points_spent: number;
  low_stock_count: number;
}

// Raw Response types
interface UserStatsRaw {
  total: number;
  today_signups: number;
  today_withdrawals: number;
}
interface ContentStatsRaw {
  active_count: number;
  total: number;
}
interface NfcTagStatsRaw {
  active_count: number;
  total: number;
}
interface OngoingContentRaw {
  id: string;
  title: string;
  start_at: string | null;
  end_at: string | null;
  participant_count: number;
}
interface HomeDashboardResponseRaw {
  users: UserStatsRaw;
  contents: ContentStatsRaw;
  nfc_tags: NfcTagStatsRaw;
  rewards: { status: string };
  errors: { status: string };
  promo: { status: string };
  ongoing_contents: OngoingContentRaw[];
}

// Transformed types
export interface UserStats {
  total: number;
  todaySignups: number;
  todayWithdrawals: number;
}
export interface ContentStats {
  activeCount: number;
  total: number;
}
export interface NfcTagStats {
  activeCount: number;
  total: number;
}
export interface HomeDashboardResponse {
  users: UserStats;
  contents: ContentStats;
  nfcTags: NfcTagStats;
  rewards: { status: string };
  errors: { status: string };
  promo: { status: string };
  ongoingContents: OngoingContentRaw[];
}

export const getAdminDashboardStats = async (): Promise<AdminStatsResponse> => {
  const response = await apiClient.get<AdminStatsResponse>('/admin/stats');
  return response.data;
};

const transformDashboardData = (data: HomeDashboardResponseRaw): HomeDashboardResponse => {
  return {
    users: {
      total: data.users.total,
      todaySignups: data.users.today_signups,
      todayWithdrawals: data.users.today_withdrawals,
    },
    contents: {
      activeCount: data.contents.active_count,
      total: data.contents.total,
    },
    nfcTags: {
      activeCount: data.nfc_tags.active_count,
      total: data.nfc_tags.total,
    },
    ongoingContents: data.ongoing_contents,
    rewards: data.rewards,
    errors: data.errors,
    promo: data.promo,
  };
};

export const getAdminHomeDashboard = async (): Promise<HomeDashboardResponse> => {
  const response = await apiClient.get<HomeDashboardResponseRaw>('/admin/home-dashboard');
  return transformDashboardData(response.data);
};