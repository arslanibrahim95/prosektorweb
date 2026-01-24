import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function enforceTenantAccess(companyId: string, _resourceId?: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const userRole = session.user.role as 'ADMIN' | 'CLIENT';

  if (userRole === 'ADMIN') return true;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true },
  });

  return user?.companyId === companyId;
}

export async function withTenantCheck<T>(
  companyId: string,
  callback: () => Promise<T>
): Promise<T | null> {
  const hasAccess = await enforceTenantAccess(companyId);
  if (!hasAccess) {
    throw new Error('Unauthorized: You do not have access to this resource');
  }
  return callback();
}

export async function getUserCompanyId(userId: string, userRole: string): Promise<string | null> {
  if (userRole === 'ADMIN') return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true },
  });

  return user?.companyId || null;
}
