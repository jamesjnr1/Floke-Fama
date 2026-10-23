'use server';

import { revalidatePath } from 'next/cache';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { getAdminSession } from '@/lib/auth/server';
import type { OrderStatus, SavedOrder } from '@/lib/orders';

const statuses: OrderStatus[] = ['awaiting-payment', 'paid', 'processing', 'delivered'];

/** Moves an order along (awaiting payment → paid → being prepared → delivered). Admins only. */
export async function setOrderStatus(form: FormData) {
  const s = await getAdminSession();
  if (s?.role !== 'admin' || !appwrite) return;
  const reference = String(form.get('reference') ?? '');
  const status = String(form.get('status') ?? '') as OrderStatus;
  if (!/^FF-[A-Z0-9]{4,12}$/.test(reference) || !statuses.includes(status)) return;
  const row = await appwrite.tables.getRow({ databaseId: DATABASE_ID, tableId: TABLES.orders, rowId: reference });
  const order = JSON.parse(String((row as unknown as { data: string }).data)) as SavedOrder;
  await appwrite.tables.updateRow({ databaseId: DATABASE_ID, tableId: TABLES.orders, rowId: reference, data: { data: JSON.stringify({ ...order, status }) } });
  revalidatePath('/admin');
}
