'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCampaign } from '@/lib/api/campaigns'

const MAX_CAMPAIGN_NAME_LENGTH = 25

export default function NewCampaignPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter a campaign name')
      return
    }
    if (name.length > MAX_CAMPAIGN_NAME_LENGTH) {
      alert(`Campaign name must be ${MAX_CAMPAIGN_NAME_LENGTH} characters or less`)
      return
    }

    try {
      setCreating(true)
      const campaign = await createCampaign({ name })
      router.push(`/admin/campaigns/${campaign.id}`)
    } catch (err: any) {
      alert('Failed to create campaign: ' + err.message)
      setCreating(false)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Campaign</h1>
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Name
            <span className="text-gray-500 font-normal ml-1">
              ({name.length}/{MAX_CAMPAIGN_NAME_LENGTH})
            </span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              const newValue = e.target.value
              if (newValue.length <= MAX_CAMPAIGN_NAME_LENGTH) {
                setName(newValue)
              }
            }}
            maxLength={MAX_CAMPAIGN_NAME_LENGTH}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Q1 2024 Outreach"
            required
          />
          {name.length > MAX_CAMPAIGN_NAME_LENGTH - 5 && (
            <p className="text-xs text-orange-600 mt-1">
              {MAX_CAMPAIGN_NAME_LENGTH - name.length} characters remaining
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creating}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  )
}
