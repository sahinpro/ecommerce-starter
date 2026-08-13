import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard: Customers'
};

/** Legacy starter route — customers now live at /dashboard/customers. */
export default function UsersPage() {
  redirect('/dashboard/customers');
}
