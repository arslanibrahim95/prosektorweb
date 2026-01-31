'use client'

import { useState } from 'react'
import {
    User,
    Settings,
    LogOut,
    ChevronUp,
    Shield,
    Stethoscope,
    Briefcase,
    Building2
} from 'lucide-react'
import Link from 'next/link'

// User role types matching the schema
export type UserRole = 'ADMIN' | 'DOCTOR' | 'EXPERT' | 'OFFICE'

interface UserAvatarProps {
    name?: string | null
    email?: string | null
    role?: UserRole
    avatarUrl?: string | null
}

const roleConfig: Record<UserRole, { label: string; icon: typeof Shield; color: string; bgColor: string }> = {
    ADMIN: {
        label: 'Yönetici',
        icon: Shield,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
    },
    DOCTOR: {
        label: 'Hekim',
        icon: Stethoscope,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50'
    },
    EXPERT: {
        label: 'Uzman',
        icon: Briefcase,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
    },
    OFFICE: {
        label: 'Ofis',
        icon: Building2,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
    },
}

export function UserAvatar({ name, email, role = 'OFFICE', avatarUrl }: UserAvatarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const config = roleConfig[role]
    const RoleIcon = config.icon

    // Get initials from name or email
    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : email
            ? email[0].toUpperCase()
            : '?'

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors"
            >
                {/* Avatar */}
                <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                    ${role === 'ADMIN' ? 'bg-gradient-to-br from-red-500 to-red-700' :
                        role === 'DOCTOR' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
                            role === 'EXPERT' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                                'bg-gradient-to-br from-purple-500 to-purple-700'}
                `}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={name || 'User'} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        initials
                    )}
                </div>

                {/* User Info - Hidden on small screens */}
                <div className="hidden lg:block text-left">
                    <div className="text-sm font-semibold text-foreground">
                        {name || 'Kullanıcı'}
                    </div>
                    <div className={`
                        text-xs flex items-center gap-1 ${config.color}
                    `}>
                        <RoleIcon className="w-3 h-3" />
                        {config.label}
                    </div>
                </div>

                <ChevronUp className={`
                    w-4 h-4 text-muted-foreground hidden lg:block transition-transform
                    ${isOpen ? 'rotate-180' : ''}
                `} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-background rounded-xl border border-border shadow-lg z-50 overflow-hidden">
                        {/* User Info Header */}
                        <div className="p-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center text-white font-bold
                                    ${role === 'ADMIN' ? 'bg-gradient-to-br from-red-500 to-red-700' :
                                        role === 'DOCTOR' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
                                            role === 'EXPERT' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                                                'bg-gradient-to-br from-purple-500 to-purple-700'}
                                `}>
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={name || 'User'} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        initials
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-foreground truncate">
                                        {name || 'Kullanıcı'}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {email}
                                    </div>
                                    <div className={`
                                        text-xs flex items-center gap-1 mt-1 ${config.color}
                                    `}>
                                        <RoleIcon className="w-3 h-3" />
                                        {config.label}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                            <Link
                                href="/admin/profile"
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <User className="w-4 h-4" />
                                Profil
                            </Link>
                            <Link
                                href="/admin/settings"
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Settings className="w-4 h-4" />
                                Ayarlar
                            </Link>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border" />

                        {/* Logout */}
                        <div className="p-2">
                            <form action="/api/auth/signout" method="POST">
                                <button
                                    type="submit"
                                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Çıkış Yap
                                </button>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
