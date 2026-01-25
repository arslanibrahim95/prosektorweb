'use client'

import { deleteSystemUser } from "@/features/system/actions/system-users"
import { Trash2 } from "lucide-react"
import { useTransition } from "react"

export function DeleteSystemUserButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = async () => {
        if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
            startTransition(async () => {
                await deleteSystemUser(id)
            })
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-neutral-400 hover:text-red-600 transition-colors p-2 hover:bg-neutral-100 rounded-lg"
            title="Sil"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    )
}
