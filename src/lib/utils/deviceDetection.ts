'use server';

import { headers } from 'next/headers';
import { userAgent } from 'next/server';

export async function isIosDevice() {
  const headersList = await headers();
  const { os } = userAgent({ headers: headersList });
  return os.name?.toLowerCase() === 'ios';
}