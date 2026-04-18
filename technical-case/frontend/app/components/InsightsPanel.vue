<script setup lang="ts">
type TransactionStage =
  | 'agreement'
  | 'earnest_money'
  | 'title_deed'
  | 'completed'

type Transaction = {
  _id: string
  propertyId: string
  listingAgent: string
  sellingAgent: string
  serviceFee: number
  stage: TransactionStage
}

type BreakdownEntry = {
  amount: number
  role: string
}

type BreakdownResponse = {
  transactionId: string
  breakdown: Record<string, BreakdownEntry>
  total: number
}

type AgentEarningsResponse = {
  agentName: string
  totalEarnings: number
  transactionCount: number
}

defineProps<{
  selectedTransaction: Transaction | null
  selectedBreakdown: BreakdownResponse | null
  earnings: AgentEarningsResponse | null
  panelLoading: boolean
  agentName: string
  formatCurrency: (value: number) => string
  formatStage: (stage: TransactionStage) => string
}>()

const emit = defineEmits<{
  'update:agentName': [value: string]
  submit: []
}>()
</script>

<template>
  <aside class="bg-card border border-line shadow-custom backdrop-blur-[8px] rounded-3xl p-6">
    <div class="flex justify-between items-start gap-4 mb-5">
      <div>
        <p class="text-xs uppercase tracking-widest text-accent-dark mb-2">Insights</p>
        <h2 class="m-0 leading-none">Breakdown ve Earnings</h2>
      </div>
    </div>

    <form class="grid gap-3.5" @submit.prevent="emit('submit')">
      <label class="grid gap-2">
        <span class="text-sm text-muted">Agent Earnings Lookup</span>
        <input
          :value="agentName"
          placeholder="john"
          class="w-full border border-line bg-[rgba(255,255,255,0.72)] rounded-xl py-3.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-[rgba(194,91,51,0.2)] focus:border-accent"
          @input="emit('update:agentName', ($event.target as HTMLInputElement).value)"
        />
      </label>
      <button class="rounded-full py-2.5 px-4 bg-bg-strong border border-line text-text hover:-translate-y-0.5 transition-all duration-200" type="submit">
        Earnings Getir
      </button>
    </form>

    <div v-if="earnings" class="rounded-xl p-4 border border-line bg-[rgba(255,255,255,0.58)] mt-3.5">
      <strong class="block mb-2.5">{{ earnings.agentName }}</strong>
      <p>Total earnings: {{ formatCurrency(earnings.totalEarnings) }}</p>
      <small>{{ earnings.transactionCount }} transaction bulundu</small>
    </div>

    <div v-if="selectedTransaction" class="rounded-xl p-4 border border-line bg-[rgba(255,255,255,0.58)] mt-3.5">
      <strong class="block mb-2.5">{{ selectedTransaction.propertyId }}</strong>
      <p>Stage: {{ formatStage(selectedTransaction.stage) }}</p>
      <p>Fee: {{ formatCurrency(selectedTransaction.serviceFee) }}</p>
    </div>

    <div v-if="panelLoading" class="rounded-xl p-4 border border-line bg-[rgba(255,255,255,0.58)] mt-3.5">Bilgiler yukleniyor...</div>

    <div v-else-if="selectedBreakdown" class="grid gap-2.5 mt-3.5">
      <div
        v-for="(entry, key) in selectedBreakdown.breakdown"
        :key="key"
        class="rounded-xl border border-line bg-[rgba(255,255,255,0.55)] p-4"
      >
        <div class="flex justify-between items-center gap-4">
          <span class="font-medium">{{ key }}</span>
          <strong>{{ formatCurrency(entry.amount) }}</strong>
        </div>
        <p class="text-sm text-muted mt-1">{{ entry.role }}</p>
      </div>
      <div class="flex justify-between items-center gap-4 py-3.5 px-4 rounded-xl border border-line bg-bg-strong">
        <span>Total</span>
        <strong>{{ formatCurrency(selectedBreakdown.total) }}</strong>
      </div>
    </div>

    <div v-else class="rounded-xl p-4 border border-line bg-[rgba(255,255,255,0.58)] mt-3.5">
      Bir transaction seçince breakdown burada görünecek.
    </div>
  </aside>
</template>
