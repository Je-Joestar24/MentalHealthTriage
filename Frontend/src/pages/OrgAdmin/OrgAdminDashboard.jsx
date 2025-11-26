import React from 'react';
import useCompanyDashboard from '../../hooks/companyDashboardHook';
import CompanyDashboardBody from '../../components/company/dashboard/CompanyDashboardBody';

export default function OrgAdminDashboard() {
  const { stats, loading, error, refetch } = useCompanyDashboard();

  return <CompanyDashboardBody stats={stats} loading={loading} error={error} />;
}
