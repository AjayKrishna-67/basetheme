'use client';

import { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';

const SESSION_KEY = 'nextOfferShownInSession';
const LOCAL_KEY = 'nextOfferShownIds';

interface BannerPopup {
  id: string;
  asset?: { id: string; source: string; preview: string } | null;
  product?: { id: string; name: string } | null;
  collection?: { id: string; name: string } | null;
  productVariant?: { id: string; name: string; sku: string } | null;
}

function getShownIds(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function setShownIds(ids: string[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

function isShownThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

function markShownThisSession() {
  try {
    sessionStorage.setItem(SESSION_KEY, 'true');
  } catch {
    /* ignore */
  }
}

export function NextOfferPoster() {
  const [banner, setBanner] = useState<BannerPopup | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Already shown a banner in this tab session — skip
        if (isShownThisSession()) return;

        const res = await fetch('/api/next-offer', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { banner: BannerPopup | null };
        if (cancelled || !data.banner) return;

        let shownIds = getShownIds();

        // If this banner was already shown in a previous session,
        // all banners have cycled — reset and start fresh
        if (shownIds.includes(data.banner.id)) {
          shownIds = [];
        }

        // Show the banner
        setBanner(data.banner);
        setOpen(true);

        // Mark in both storages
        markShownThisSession();
        setShownIds([...shownIds, data.banner.id]);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!banner || !banner.asset) return null;

  const close = () => setOpen(false);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[80]" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-lg">
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close banner"
                  className="absolute -top-3 -right-3 z-10 rounded-full bg-white p-1.5 shadow-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-700" />
                </button>
                <div className="block w-full overflow-hidden rounded-2xl shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.asset.source}
                    alt={banner.product?.name || banner.collection?.name || 'Special offer'}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
