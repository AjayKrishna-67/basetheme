import { NextResponse } from 'next/server';
import {
  addItemToOrder,
  adjustOrderLine,
  getActiveOrder,
  getActiveOrderWithHeaders,
  removeOrderLine,
  setCustomerForOrder,
  setOrderShippingAddress,
  setOrderShippingMethod,
  getCouponCodeList,
  removeCouponCode,
  removeAllOrderLines,
} from '@/providers/orders';
import {
  CreateAddressInput,
  CreateCustomerInput,
  ErrorCode,
  ErrorResult,
  OrderDetailFragment,
} from '@/generated/graphql';
import { getSession, setAuthToken } from '@/lib/session';
import { shippingFormDataIsValid } from '@/lib/validation';

export async function GET(request: Request) {
  const { activeOrder, _headers } = await getActiveOrderWithHeaders();

  // Persist anonymous auth token if not already signed in
  const vendureAuthToken = _headers.get('vendure-auth-token');
  const session = await getSession();

  if (vendureAuthToken && !session.authToken) {
    await setAuthToken(vendureAuthToken);
  }

  return NextResponse.json({ activeOrder });
}

export async function POST(request: Request) {
  const body = await request.formData();
  const formAction = body.get('action');
  let activeOrder: OrderDetailFragment | undefined = undefined;
  let error: ErrorResult = {
    errorCode: ErrorCode.NoActiveOrderError,
    message: '',
  };
  let vendureAuthToken: string | undefined;

  switch (formAction) {
    case 'setCheckoutShipping':
      if (shippingFormDataIsValid(body)) {
        const shippingFormData = Object.fromEntries<any>(
          body.entries(),
        ) as CreateAddressInput;
        const result = await setOrderShippingAddress(
          {
            city: shippingFormData.city,
            company: shippingFormData.company,
            countryCode: shippingFormData.countryCode,
            customFields: shippingFormData.customFields,
            fullName: shippingFormData.fullName,
            phoneNumber: shippingFormData.phoneNumber,
            postalCode: shippingFormData.postalCode,
            province: shippingFormData.province,
            streetLine1: shippingFormData.streetLine1,
            streetLine2: shippingFormData.streetLine2,
          },
        );
        if (result.setOrderShippingAddress.__typename === 'Order') {
          activeOrder = result.setOrderShippingAddress;
        } else {
          error = result.setOrderShippingAddress;
        }
      }
      break;
    case 'setOrderCustomer': {
      const customerData = Object.fromEntries<any>(
        body.entries(),
      ) as CreateCustomerInput;
      const result = await setCustomerForOrder(
        {
          emailAddress: customerData.emailAddress,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
        },
      );
      if (result.setCustomerForOrder.__typename === 'Order') {
        activeOrder = result.setCustomerForOrder;
      } else {
        error = result.setCustomerForOrder;
      }
      break;
    }
    case 'setShippingMethod': {
      const shippingMethodId = body.get('shippingMethodId');
      if (typeof shippingMethodId === 'string') {
        const result = await setOrderShippingMethod(shippingMethodId);
        if (result.setOrderShippingMethod.__typename === 'Order') {
          activeOrder = result.setOrderShippingMethod;
        } else {
          error = result.setOrderShippingMethod;
        }
      }
      break;
    }
    case 'removeItem': {
      const lineId = body.get('lineId');

      // Get current order to check if we're removing a coupon product
      const currentOrder = await getActiveOrder();
      const line = currentOrder?.lines.find((l) => l.id === lineId);
      const appliedCouponCode = currentOrder?.couponCodes?.[0];

      // Check if the item being removed is a coupon product
      if (line && appliedCouponCode) {
        try {
          const couponList = await getCouponCodeList();
          const coupon = couponList.find(
            (c) => c.couponCode === appliedCouponCode,
          );

          if (coupon) {
            const productVariantIds: string[] = [];
            for (const condition of coupon.conditions) {
              const variantArg = condition.args.find(
                (arg: any) => arg.name === 'productVariantIds',
              );
              if (variantArg && variantArg.value) {
                try {
                  let parsedIds: string[] | string = variantArg.value;
                  if (variantArg.value.startsWith('[')) {
                    parsedIds = JSON.parse(variantArg.value);
                  } else {
                    parsedIds = [variantArg.value];
                  }
                  if (Array.isArray(parsedIds)) {
                    productVariantIds.push(
                      ...parsedIds.map((id) => id.toString()),
                    );
                  } else if (typeof parsedIds === 'string') {
                    productVariantIds.push(parsedIds);
                  }
                } catch (e) {
                  console.error(
                    'Failed to parse productVariantIds:',
                    variantArg.value,
                    e,
                  );
                }
              }
            }

            const isCouponProduct = productVariantIds
              .map(String)
              .includes(String(line.productVariant.id));

            if (isCouponProduct) {
              // Remove the coupon first
              await removeCouponCode(appliedCouponCode);
            }
          }
        } catch (error) {
          console.error('Error checking/removing coupon:', error);
          // Continue with item removal even if coupon removal fails
        }
      }

      // Remove the item
      let result;
      try {
        result = await removeOrderLine(lineId?.toString() ?? '');
      } catch (e) {
        // Order line may not exist (stale session) -- return current order
        console.error('Error removing order line:', e);
        activeOrder = (await getActiveOrder()) ?? undefined;
        break;
      }
      vendureAuthToken = result._headers?.get('vendure-auth-token') ?? vendureAuthToken;
      if (result.removeOrderLine.__typename === 'Order') {
        activeOrder = result.removeOrderLine;

        // After removing the item, check if only coupon items remain
        const updatedOrder = await getActiveOrder();
        const appliedCouponCode = updatedOrder?.couponCodes?.[0];

        if (
          appliedCouponCode &&
          updatedOrder?.lines &&
          updatedOrder.lines.length > 0
        ) {
          try {
            const couponList = await getCouponCodeList();
            const coupon = couponList.find(
              (c) => c.couponCode === appliedCouponCode,
            );

            if (coupon) {
              const productVariantIds: string[] = [];
              for (const condition of coupon.conditions) {
                const variantArg = condition.args.find(
                  (arg: any) => arg.name === 'productVariantIds',
                );
                if (variantArg && variantArg.value) {
                  try {
                    let parsedIds: string[] | string = variantArg.value;
                    if (variantArg.value.startsWith('[')) {
                      parsedIds = JSON.parse(variantArg.value);
                    } else {
                      parsedIds = [variantArg.value];
                    }
                    if (Array.isArray(parsedIds)) {
                      productVariantIds.push(
                        ...parsedIds.map((id) => id.toString()),
                      );
                    } else if (typeof parsedIds === 'string') {
                      productVariantIds.push(parsedIds);
                    }
                  } catch (e) {
                    console.error(
                      'Failed to parse productVariantIds:',
                      variantArg.value,
                      e,
                    );
                  }
                }
              }

              // Check if all remaining items are coupon items
              const allItemsAreCouponItems = updatedOrder.lines.every((line) =>
                productVariantIds.includes(line.productVariant.id),
              );

              // If all items are coupon items, remove the coupon (but keep the products)
              if (allItemsAreCouponItems) {
                console.log(
                  'All remaining items are coupon items, removing coupon:',
                  appliedCouponCode,
                );
                try {
                  await removeCouponCode(appliedCouponCode);
                  console.log('Coupon removed successfully');

                  const finalOrder = await getActiveOrder();
                  activeOrder = finalOrder ? finalOrder : undefined;
                } catch (error) {
                  console.error('Failed to remove coupon:', error);
                }
              }
            }
          } catch (error) {
            console.error('Error checking coupon items:', error);
          }
        }
      } else {
        error = result.removeOrderLine;
      }
      break;
    }
    case 'adjustItem': {
      const lineId = body.get('lineId');
      const quantity = body.get('quantity');
      if (lineId && quantity != null) {
        let result;
        try {
          result = await adjustOrderLine(lineId?.toString(), +quantity);
        } catch (e) {
          console.error('Error adjusting order line:', e);
          activeOrder = (await getActiveOrder()) ?? undefined;
          break;
        }
        vendureAuthToken = result._headers?.get('vendure-auth-token') ?? vendureAuthToken;
        if (result.adjustOrderLine.__typename === 'Order') {
          activeOrder = result.adjustOrderLine;

          const updatedOrder = await getActiveOrder();
          const appliedCouponCode = updatedOrder?.couponCodes?.[0];

          if (
            appliedCouponCode &&
            updatedOrder?.lines &&
            updatedOrder.lines.length > 0
          ) {
            try {
              const couponList = await getCouponCodeList();
              const coupon = couponList.find(
                (c) => c.couponCode === appliedCouponCode,
              );

              if (coupon) {
                const productVariantIds: string[] = [];
                for (const condition of coupon.conditions) {
                  const variantArg = condition.args.find(
                    (arg: any) => arg.name === 'productVariantIds',
                  );
                  if (variantArg && variantArg.value) {
                    try {
                      let parsedIds: string[] | string = variantArg.value;
                      if (variantArg.value.startsWith('[')) {
                        parsedIds = JSON.parse(variantArg.value);
                      } else {
                        parsedIds = [variantArg.value];
                      }
                      if (Array.isArray(parsedIds)) {
                        productVariantIds.push(
                          ...parsedIds.map((id) => id.toString()),
                        );
                      } else if (typeof parsedIds === 'string') {
                        productVariantIds.push(parsedIds);
                      }
                    } catch (e) {
                      console.error(
                        'Failed to parse productVariantIds:',
                        variantArg.value,
                        e,
                      );
                    }
                  }
                }

                const allItemsAreCouponItems = updatedOrder.lines.every(
                  (line) => productVariantIds.includes(line.productVariant.id),
                );

                const minAmountCondition = coupon.conditions.find(
                  (c: any) =>
                    c.code === 'minimum_order_amount' ||
                    c.code === 'minimumOrderAmount' ||
                    c.code === 'minimumAmount',
                );

                const subtotalPaise = updatedOrder?.lines.reduce(
                  (acc: number, line) => acc + (line.linePriceWithTax ?? 0),
                  0,
                ) ?? 0;
                let shouldRemoveCoupon = allItemsAreCouponItems;

                if (minAmountCondition && !shouldRemoveCoupon) {
                  const amountArg =
                    minAmountCondition.args.find(
                      (a: any) => a.name === 'amount',
                    ) ?? minAmountCondition.args[0];
                  const minAmountPaise =
                    Number.parseInt(amountArg.value, 10) || 0;

                  if (subtotalPaise < minAmountPaise) {
                    shouldRemoveCoupon = true;
                    console.log(
                      `Order subtotal ${subtotalPaise} is below minimum ${minAmountPaise}, removing coupon: ${appliedCouponCode}`,
                    );
                  }
                }

                if (shouldRemoveCoupon) {
                  console.log('Removing coupon:', appliedCouponCode);
                  try {
                    await removeCouponCode(appliedCouponCode);
                    console.log('Coupon removed successfully');

                    const finalOrder = await getActiveOrder();
                    activeOrder = finalOrder ? finalOrder : undefined;
                  } catch (error) {
                    console.error('Failed to remove coupon:', error);
                  }
                }
              }
            } catch (error) {
              console.error('Error checking coupon items:', error);
            }
          }
        } else {
          error = result.adjustOrderLine;
        }
      }
      break;
    }
    case 'addItemToOrder': {
      const variantId = body.get('variantId')?.toString();
      const quantity = Number(body.get('quantity')?.toString() ?? 1);
      if (!variantId || !(quantity > 0)) {
        return NextResponse.json(
          { error: `Invalid input: variantId ${variantId}, quantity ${quantity}` },
          { status: 400 },
        );
      }
      let result;
      try {
        result = await addItemToOrder(variantId, quantity);
      } catch (e) {
        console.error('Error adding item to order:', e);
        activeOrder = (await getActiveOrder()) ?? undefined;
        break;
      }
      vendureAuthToken = result._headers?.get('vendure-auth-token') ?? undefined;
      if (result.addItemToOrder.__typename === 'Order') {
        activeOrder = result.addItemToOrder as any as OrderDetailFragment;
      } else {
        error = result.addItemToOrder;
      }
      break;
    }
    case 'removeAllItems': {
      const result = await removeAllOrderLines();
      if (result.removeAllOrderLines.__typename !== 'Order') {
        error = result.removeAllOrderLines as any;
      }
      break;
    }
    case 'addPaymentToOrder': {
      // Handle payment addition (not implemented in provided code)
      break;
    }
    default:
    // Don't do anything
  }

  const session = await getSession();

  // Persist anonymous auth token if user is not signed in
  if (vendureAuthToken && !session.authToken) {
    session.authToken = vendureAuthToken;
    await session.save();
  }

  // Always re-fetch the active order to get computed fields like quantityLimitStatus
  const finalActiveOrder = (await getActiveOrder()) || activeOrder;

  return NextResponse.json({
    activeOrder: finalActiveOrder || undefined,
    error: error?.errorCode !== ErrorCode.NoActiveOrderError ? error : undefined,
  });
}
