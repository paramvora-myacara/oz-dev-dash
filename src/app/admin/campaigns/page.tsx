'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, ArrowRight, Table2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CampaignsRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Small delay to show the "Moved" state briefly
    const timer = setTimeout(() => {
      router.replace('/admin/crm')
    }, 1500)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border shadow-xl p-10 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center bg-blue-50 rounded-full">
          <Table2 className="w-12 h-12 text-blue-600" />
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping opacity-25" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Campaigns have moved!</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            We've integrated the campaign dashboard into the <span className="text-blue-600 font-bold">Consolidated CRM</span> for a better workflow.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Redirecting you now...
          </div>

          <Button
            onClick={() => router.push('/admin/crm')}
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Take me there
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
        OZ Listings | Infrastructure V2
      </p>
    </div>
  )
}
