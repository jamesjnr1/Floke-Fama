import { redirect } from 'next/navigation';

/** Accounts are hospital accounts: "My account" is the hospital dashboard. */
export default function AccountPage() {
  redirect('/portal');
}
