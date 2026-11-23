import { useTranslation } from 'react-i18next';

// Copied from https://www.vendure.io/docs/typescript-api/orders/order-state/
type OrderState =
  | 'Created'
  | 'Draft'
  | 'AddingItems'
  | 'ArrangingPayment'
  | 'PaymentAuthorized'
  | 'PaymentSettled'
  | 'PartiallyShipped'
  | 'Shipped'
  | 'PartiallyDelivered'
  | 'Delivered'
  | 'Modifying'
  | 'ArrangingAdditionalPayment'
  | 'CancellationRequested'
  | 'Cancelled';

export function OrderStateBadge({ state }: { state?: string }) {
  const { t } = useTranslation();

  let colorClasses = '';
  switch (state as OrderState) {
    default:
    case 'Draft':
    case 'AddingItems':
      colorClasses = 'bg-text-tertiary text-text-primary';
      break;
    case 'PaymentAuthorized':
    case 'PaymentSettled':
    case 'Shipped':
      colorClasses = 'bg-semantic-info-light text-semantic-info';
      break;
    case 'Delivered':
      colorClasses = 'bg-semantic-success-light text-semantic-success';
      break;
    case 'PartiallyShipped':
    case 'PartiallyDelivered':
    case 'Modifying':
    case 'ArrangingPayment':
    case 'ArrangingAdditionalPayment':
      colorClasses = 'bg-semantic-warning-light text-semantic-warning';
      break;
    case 'CancellationRequested':
      colorClasses = 'bg-orange-100 text-orange-700';
      break;
    case 'Cancelled':
      colorClasses = 'bg-semantic-error-light text-semantic-error';
      break;
  }

  return (
    <span
      className={`text-xs font-medium px-2.5 py-0.5 rounded uppercase whitespace-nowrap ${colorClasses}`}
    >
      {t(`order.states.${state}`) ?? t(`order.states.Unknown`)}
    </span>
  );
}
