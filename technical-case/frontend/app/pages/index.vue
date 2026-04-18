<script setup lang="ts">
type TransactionStage =
  | 'agreement'
  | 'earnest_money'
  | 'title_deed'
  | 'completed'

type BreakdownEntry = {
  amount: number
  role: string
}

type Transaction = {
  _id: string
  propertyId: string
  listingAgent: string
  sellingAgent: string
  serviceFee: number
  stage: TransactionStage
  breakdown: Record<string, BreakdownEntry>
  createdAt?: string
  updatedAt?: string
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

const config = useRuntimeConfig()
const apiBase = config.public.apiBase

useSeoMeta({
  title: 'Transaction Dashboard',
  description: 'Frontend dashboard for the technical case transaction workflow.',
})

const transactions = ref<Transaction[]>([])
const loading = ref(false)
const submitting = ref(false)
const deletingId = ref<string | null>(null)
const panelLoading = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const activeMessage = ref('')
const activeError = ref('')
const selectedTransaction = ref<Transaction | null>(null)
const selectedBreakdown = ref<BreakdownResponse | null>(null)
const earnings = ref<AgentEarningsResponse | null>(null)
const searchTerm = ref('')
const stageFilter = ref<'all' | TransactionStage>('all')
const lastUpdatedAt = ref('')

const form = reactive({
  id: '',
  propertyId: '',
  listingAgent: '',
  sellingAgent: '',
  serviceFee: 10000,
  stage: 'agreement' as TransactionStage,
})

const earningsForm = reactive({
  agentName: '',
})

const STAGE_TRANSITIONS: Record<TransactionStage, TransactionStage[]> = {
  agreement: ['earnest_money'],
  earnest_money: ['title_deed'],
  title_deed: ['completed'],
  completed: [],
}

const stageOptions: Array<{ value: TransactionStage; label: string }> = [
  { value: 'agreement', label: 'Agreement' },
  { value: 'earnest_money', label: 'Earnest Money' },
  { value: 'title_deed', label: 'Title Deed' },
  { value: 'completed', label: 'Completed' },
]

const totalVolume = computed(() =>
  transactions.value.reduce((sum, item) => sum + item.serviceFee, 0),
)

const completedCount = computed(
  () => transactions.value.filter(item => item.stage === 'completed').length,
)

const sameAgentDeals = computed(
  () =>
    transactions.value.filter(
      item => item.listingAgent === item.sellingAgent,
    ).length,
)

const stageSummary = computed(() => ({
  agreement: transactions.value.filter(item => item.stage === 'agreement').length,
  earnest_money: transactions.value.filter(
    item => item.stage === 'earnest_money',
  ).length,
  title_deed: transactions.value.filter(item => item.stage === 'title_deed').length,
  completed: transactions.value.filter(item => item.stage === 'completed').length,
}))

const filteredTransactions = computed(() => {
  const normalizedSearch = searchTerm.value.trim().toLowerCase()

  return transactions.value.filter((item) => {
    const matchesStage =
      stageFilter.value === 'all' ? true : item.stage === stageFilter.value

    const matchesSearch = normalizedSearch
      ? [item.propertyId, item.listingAgent, item.sellingAgent]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)
      : true

    return matchesStage && matchesSearch
  })
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatStage(stage: TransactionStage) {
  return stage.replaceAll('_', ' ')
}

function formatRelativeTime(value: string) {
  if (!value) {
    return 'henuz yenilenmedi'
  }

  const formatter = new Intl.RelativeTimeFormat('tr', { numeric: 'auto' })
  const diffInMinutes = Math.round(
    (new Date(value).getTime() - Date.now()) / (1000 * 60),
  )

  if (Math.abs(diffInMinutes) < 60) {
    return formatter.format(diffInMinutes, 'minute')
  }

  const diffInHours = Math.round(diffInMinutes / 60)
  return formatter.format(diffInHours, 'hour')
}

function getErrorMessage(error: any, fallback: string) {
  const message =
    error?.data?.message ??
    error?.response?.data?.message ??
    error?.message ??
    error

  return Array.isArray(message) ? message.join(', ') : message ?? fallback
}

function resetFeedback() {
  activeMessage.value = ''
  activeError.value = ''
}

function resetForm() {
  formMode.value = 'create'
  form.id = ''
  form.propertyId = ''
  form.listingAgent = ''
  form.sellingAgent = ''
  form.serviceFee = 10000
  form.stage = 'agreement'
}

function startEdit(transaction: Transaction) {
  resetFeedback()
  formMode.value = 'edit'
  form.id = transaction._id
  form.propertyId = transaction.propertyId
  form.listingAgent = transaction.listingAgent
  form.sellingAgent = transaction.sellingAgent
  form.serviceFee = transaction.serviceFee
  form.stage = transaction.stage
}

async function loadTransactions() {
  loading.value = true
  resetFeedback()

  try {
    transactions.value = await $fetch<Transaction[]>(`${apiBase}/transactions`)
    lastUpdatedAt.value = new Date().toISOString()

    if (selectedTransaction.value) {
      selectedTransaction.value =
        transactions.value.find(item => item._id === selectedTransaction.value?._id) ??
        null
    }
  } catch (error: any) {
    activeError.value =
      error?.data?.message?.[0] ??
      error?.data?.message ??
      'Transactions verisi alınamadı.'
  } finally {
    loading.value = false
  }
}

async function submitForm() {
  submitting.value = true
  resetFeedback()

  const payload =
    formMode.value === 'create'
      ? {
          propertyId: form.propertyId,
          listingAgent: form.listingAgent,
          sellingAgent: form.sellingAgent,
          serviceFee: Number(form.serviceFee),
        }
      : {
          propertyId: form.propertyId,
          listingAgent: form.listingAgent,
          sellingAgent: form.sellingAgent,
          serviceFee: Number(form.serviceFee),
          stage: form.stage,
        }

  try {
    const requestOptions = {
      method: formMode.value === 'create' ? 'POST' : 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }

    if (formMode.value === 'create') {
      await $fetch(`${apiBase}/transactions`, requestOptions)
      activeMessage.value = 'Transaction olusturuldu.'
    } else {
      await $fetch(`${apiBase}/transactions/${form.id}`, requestOptions)
      activeMessage.value = 'Transaction guncellendi.'
    }

    resetForm()
    await loadTransactions()
  } catch (error: any) {
    activeError.value = getErrorMessage(error, 'Kayit islemi basarisiz oldu.')
  } finally {
    submitting.value = false
  }
}

async function removeTransaction(id: string) {
  deletingId.value = id
  resetFeedback()

  try {
    await $fetch(`${apiBase}/transactions/${id}`, {
      method: 'DELETE',
    })
    activeMessage.value = 'Transaction silindi.'

    if (selectedTransaction.value?._id === id) {
      selectedTransaction.value = null
      selectedBreakdown.value = null
    }

    if (form.id === id) {
      resetForm()
    }

    await loadTransactions()
  } catch (error: any) {
    activeError.value =
      error?.data?.message ?? 'Silme islemi sirasinda bir hata oldu.'
  } finally {
    deletingId.value = null
  }
}

async function inspectTransaction(transaction: Transaction) {
  selectedTransaction.value = transaction
  selectedBreakdown.value = null
  panelLoading.value = true
  resetFeedback()

  try {
    selectedBreakdown.value = await $fetch<BreakdownResponse>(
      `${apiBase}/transactions/${transaction._id}/breakdown`,
    )
  } catch (error: any) {
    activeError.value =
      error?.data?.message ?? 'Breakdown bilgisi alinamadi.'
  } finally {
    panelLoading.value = false
  }
}

async function fetchAgentEarnings() {
  if (!earningsForm.agentName.trim()) {
    activeError.value = 'Agent adi girmen gerekiyor.'
    return
  }

  resetFeedback()
  panelLoading.value = true

  try {
    earnings.value = await $fetch<AgentEarningsResponse>(
      `${apiBase}/transactions/agent/${earningsForm.agentName}/earnings`,
    )
  } catch (error: any) {
    activeError.value =
      error?.data?.message ?? 'Agent earnings bilgisi alinamadi.'
  } finally {
    panelLoading.value = false
  }
}

onMounted(async () => {
  await loadTransactions()
})
</script>

<template>
  <div class="w-full max-w-[1180px] mx-auto px-4 py-10 pb-14 md:px-8">
    <NuxtRouteAnnouncer />

    <header class="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6 items-end mb-7">
      <div>
        <p class="text-xs uppercase tracking-widest text-accent-dark mb-2">Technical Case Dashboard</p>
        <h1 class="text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-none max-w-[11ch]">Transaction Yönetimi</h1>
        <p class="text-lg text-muted max-w-[56ch] leading-relaxed mt-4.5">
          Yeni kayıt ekleyebilir, stage güncelleyebilir, breakdown ve agent earnings görebilirsiniz.
        </p>
      </div>

      <div class="bg-card border border-line shadow-custom backdrop-blur-[8px] rounded-3xl p-6 grid gap-2">
      
        <div class="flex items-center gap-2.5 mt-1.5">
          <span class="w-2.5 h-2.5 bg-green-600 rounded-full shadow-[0_0_0_6px_rgba(47,133,90,0.12)]" />
          <small class="text-muted">Son yenileme {{ formatRelativeTime(lastUpdatedAt) }}</small>
        </div>
      </div>
    </header>

    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <article class="bg-card border border-line shadow-custom backdrop-blur-[8px] rounded-3xl p-5">
        <span class="block text-muted mb-3">Total Transactions</span>
        <strong class="text-3xl">{{ transactions.length }}</strong>
      </article>
      <article class="bg-card border border-line shadow-custom backdrop-blur-[8px] rounded-3xl p-5">
        <span class="block text-muted mb-3">Total Volume</span>
        <strong class="text-3xl">{{ formatCurrency(totalVolume) }}</strong>
      </article>
      <article class="bg-card border border-line shadow-custom backdrop-blur-[8px] rounded-3xl p-5">
        <span class="block text-muted mb-3">Completed Deals</span>
        <strong class="text-3xl">{{ completedCount }}</strong>
      </article>
      <article class="bg-card border border-line shadow-custom backdrop-blur-[8px] rounded-3xl p-5">
        <span class="block text-muted mb-3">Same-Agent Deals</span>
        <strong class="text-3xl">{{ sameAgentDeals }}</strong>
      </article>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <article class="p-4 border border-line bg-[rgba(255,250,245,0.72)] rounded-3xl flex justify-between items-center gap-3 shadow-[inset_0_0_0_1px_rgba(194,91,51,0.08)]">
        <span class="text-muted text-sm">Agreement</span>
        <strong class="text-2xl">{{ stageSummary.agreement }}</strong>
      </article>
      <article class="p-4 border border-line bg-[rgba(255,250,245,0.72)] rounded-3xl flex justify-between items-center gap-3 shadow-[inset_0_0_0_1px_rgba(204,142,33,0.12)]">
        <span class="text-muted text-sm">Earnest Money</span>
        <strong class="text-2xl">{{ stageSummary.earnest_money }}</strong>
      </article>
      <article class="p-4 border border-line bg-[rgba(255,250,245,0.72)] rounded-3xl flex justify-between items-center gap-3 shadow-[inset_0_0_0_1px_rgba(43,108,176,0.12)]">
        <span class="text-muted text-sm">Title Deed</span>
        <strong class="text-2xl">{{ stageSummary.title_deed }}</strong>
      </article>
      <article class="p-4 border border-line bg-[rgba(255,250,245,0.72)] rounded-3xl flex justify-between items-center gap-3 shadow-[inset_0_0_0_1px_rgba(39,103,73,0.12)]">
        <span class="text-muted text-sm">Completed</span>
        <strong class="text-2xl">{{ stageSummary.completed }}</strong>
      </article>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4 mb-4">
      <TransactionForm
        :form="form"
        :form-mode="formMode"
        :stage-options="stageOptions"
        :submitting="submitting"
        @submit="submitForm"
        @reset="resetForm"
      />

      <InsightsPanel
        :selected-transaction="selectedTransaction"
        :selected-breakdown="selectedBreakdown"
        :earnings="earnings"
        :panel-loading="panelLoading"
        :agent-name="earningsForm.agentName"
        :format-currency="formatCurrency"
        :format-stage="formatStage"
        @submit="fetchAgentEarnings"
        @update:agent-name="earningsForm.agentName = $event"
      />
    </section>

    <p v-if="activeMessage" class="m-0 mb-4 p-3.5 rounded-xl bg-[rgba(39,103,73,0.08)] text-success">{{ activeMessage }}</p>
    <p v-if="activeError" class="m-0 mb-4 p-3.5 rounded-xl bg-[rgba(197,48,48,0.08)] text-error">{{ activeError }}</p>

    <TransactionTable
      :transactions="filteredTransactions"
      :loading="loading"
      :deleting-id="deletingId"
      :selected-id="selectedTransaction?._id ?? null"
      :search-term="searchTerm"
      :stage-filter="stageFilter"
      :total-count="transactions.length"
      :format-currency="formatCurrency"
      :format-stage="formatStage"
      @refresh="loadTransactions"
      @inspect="inspectTransaction"
      @edit="startEdit"
      @remove="removeTransaction"
      @update:search-term="searchTerm = $event"
      @update:stage-filter="stageFilter = $event as 'all' | TransactionStage"
    />
  </div>
</template>
