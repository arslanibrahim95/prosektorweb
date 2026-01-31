import { auth } from '@/auth'
import { ProfileForm } from '@/features/crm/components/portal/ProfileForm'
import { PasswordForm } from '@/features/crm/components/portal/PasswordForm'
import { Settings } from 'lucide-react'

export default async function ProfilePage() {
    const session = await auth()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                    <Settings className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Profil Ayarları</h1>
                    <p className="text-neutral-500">Kişisel bilgilerinizi ve şifrenizi yönetin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProfileForm user={{
                    name: session?.user?.name,
                    email: session?.user?.email
                }} />

                <PasswordForm />
            </div>
        </div>
    )
}
