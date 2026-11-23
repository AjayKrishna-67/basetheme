import { getActiveCustomerDetails } from '@/providers/customer';
import AccountDashboardClient from './account-dashboard-client';

export default async function AccountPage() {
  const result = await getActiveCustomerDetails();
  const customer = result?.activeCustomer;

  const needsPhoneNumber = !customer?.phoneNumber || customer.phoneNumber.trim() === '';

  // Check referral eligibility: within 24h of account creation AND not already referred
  const referredBy = (customer as any)?.referredBy;
  const createdAt = (customer as any)?.createdAt;
  const isWithin24h = createdAt
    ? Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000
    : true;
  const showReferralModal = isWithin24h && !referredBy;

  return (
    <AccountDashboardClient
      customer={customer}
      needsPhoneNumber={needsPhoneNumber}
      showPhoneModal={needsPhoneNumber}
      showReferralModal={showReferralModal}
    />
  );
}
