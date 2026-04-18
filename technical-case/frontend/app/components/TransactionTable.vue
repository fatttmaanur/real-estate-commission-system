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

defineProps<{
  transactions: Transaction[]
  loading: boolean
  deletingId: string | null
  selectedId: string | null
  searchTerm: string
  stageFilter: string
  totalCount: number
  formatCurrency: (value: number) => string
  formatStage: (stage: TransactionStage) => string
}>()

const emit = defineEmits<{
  refresh: []
  inspect: [transaction: Transaction]
  edit: [transaction: Transaction]
  remove: [id: string]
  'update:searchTerm': [value: string]
  'update:stageFilter': [value: string]
}>()
</script>

<template>
  <section class="bg-card border border-line shadow-custom backdrop-blur-[8px] rounded-3xl p-6">
    <div class="flex justify-between items-start gap-4 mb-5">
      <div>
        <p class="text-xs uppercase tracking-widest text-accent-dark mb-2">Records</p>
        <h2 class="m-0 leading-none">Transaction Listesi</h2>
      </div>
      <button class="rounded-full py-2.5 px-4 bg-transparent border border-line text-text hover:-translate-y-0.5 transition-all duration-200" type="button" @click="emit('refresh')">
        Yenile
      </button>
    </div>

    <div class="grid grid-cols-[1.2fr_0.8fr] gap-3 mb-4.5">
      <label class="grid gap-2">
        <span>Ara</span>
        <input
          :value="searchTerm"
          placeholder="Property veya agent ara"
          class="w-full border border-line bg-[rgba(255,255,255,0.72)] rounded-xl py-3.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-[rgba(194,91,51,0.2)] focus:border-accent"
          @input="
            emit('update:searchTerm', ($event.target as HTMLInputElement).value)
          "
        >
      </label>

      <label class="grid gap-2 max-w-60">
        <span>Stage filtre</span>
        <select
          :value="stageFilter"
          class="w-full border border-line bg-[rgba(255,255,255,0.72)] rounded-xl py-3.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-[rgba(194,91,51,0.2)] focus:border-accent"
          @change="
            emit(
              'update:stageFilter',
              ($event.target as HTMLSelectElement).value,
            )
          "
        >
          <option value="all">Tüm stage'ler</option>
          <option value="agreement">Agreement</option>
          <option value="earnest_money">Earnest Money</option>
          <option value="title_deed">Title Deed</option>
          <option value="completed">Completed</option>
        </select>
      </label>
    </div>

    <div v-if="loading" class="rounded-xl p-4 border border-line bg-[rgba(255,255,255,0.58)] mt-3.5">Transactions yukleniyor...</div>

    <div v-else-if="transactions.length === 0" class="rounded-xl p-4 border border-line bg-[rgba(255,255,255,0.58)] mt-3.5">
      {{
        totalCount === 0
          ? 'Henüz transaction yok. Soldaki formdan ilk kaydı ekleyebilirsin.'
          : 'Filtreye uygun transaction bulunamadı.'
      }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="py-4 px-3 text-left text-muted text-sm font-semibold">Property</th>
            <th class="py-4 px-3 text-left text-muted text-sm font-semibold">Listing</th>
            <th class="py-4 px-3 text-left text-muted text-sm font-semibold">Selling</th>
            <th class="py-4 px-3 text-left text-muted text-sm font-semibold">Fee</th>
            <th class="py-4 px-3 text-left text-muted text-sm font-semibold">Stage</th>
            <th class="py-4 px-3 text-left text-muted text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="transaction in transactions"
            :key="transaction._id"
            :class="{ 'bg-[rgba(194,91,51,0.08)]': selectedId === transaction._id }"
          >
            <td class="py-4 px-3 border-b border-line">{{ transaction.propertyId }}</td>
            <td class="py-4 px-3 border-b border-line">{{ transaction.listingAgent }}</td>
            <td class="py-4 px-3 border-b border-line">{{ transaction.sellingAgent }}</td>
            <td class="py-4 px-3 border-b border-line">{{ formatCurrency(transaction.serviceFee) }}</td>
            <td class="py-4 px-3 border-b border-line">
              <span class="inline-flex rounded-full py-2 px-3 bg-[rgba(194,91,51,0.12)] text-accent-dark capitalize" :class="{
                'bg-[rgba(204,142,33,0.12)] text-[#975a16]': transaction.stage === 'earnest_money',
                'bg-[rgba(43,108,176,0.12)] text-[#2c5282]': transaction.stage === 'title_deed',
                'bg-[rgba(39,103,73,0.12)] text-success': transaction.stage === 'completed'
              }">
                {{ formatStage(transaction.stage) }}
              </span>
            </td>
            <td class="py-4 px-3 border-b border-line">
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="py-2 px-3 rounded-full bg-[rgba(36,22,15,0.08)] text-text hover:-translate-y-0.5 transition-all duration-200"
                  @click="emit('inspect', transaction)"
                >
                  Breakdown
                </button>
                <button
                  type="button"
                  class="py-2 px-3 rounded-full bg-[rgba(36,22,15,0.08)] text-text hover:-translate-y-0.5 transition-all duration-200"
                  @click="emit('edit', transaction)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="py-2 px-3 rounded-full bg-[rgba(197,48,48,0.08)] text-error hover:-translate-y-0.5 transition-all duration-200"
                  :disabled="deletingId === transaction._id"
                  @click="emit('remove', transaction._id)"
                >
                  {{ deletingId === transaction._id ? 'Siliniyor...' : 'Delete' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
