export function shippingFormDataIsValid(data: Record<string, any>): boolean {
  const requiredFields = [
    'fullName',
    'streetLine1',
    'city',
    'postalCode',
    'countryCode',
  ];
  return requiredFields.every(
    (field) => data[field] && String(data[field]).trim() !== '',
  );
}

export function replaceEmptyString(value: string | null | undefined): string {
  return value && value.trim() !== '' ? value : '-';
}
