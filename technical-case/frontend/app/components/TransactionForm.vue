<script setup lang="ts">
type TransactionStage =
  | 'agreement'
  | 'earnest_money'
  | 'title_deed'
  | 'completed'

const { formMode, form, stageOptions, submitting } = defineProps<{
  formMode: 'create' | 'edit'
  form: {
    propertyId: string
    listingAgent: string
    sellingAgent: string
    serviceFee: number
    stage: TransactionStage
  }
  stageOptions: Array<{ value: TransactionStage; label: string }>
  submitting: boolean
}>()

const STAGE_TRANSITIONS: Record<TransactionStage, TransactionStage[]> = {
  agreement: ['earnest_money'],
  earnest_money: ['title_deed'],
  title_deed: ['completed'],
  completed: [],
}

function isStageAllowed(stage: TransactionStage) {
  return form.stage === stage || STAGE_TRANSITIONS[form.stage]?.includes(stage)
}

const emit = defineEmits<{
  submit: []
  reset: []
}>()
</script>

<template>
  <div class="bg-card border border-line shadow-custom backdrop-blur-[8px] rounded-3xl p-6">
    <div class="flex justify-between items-start gap-4 mb-5">
      <div>
        <p class="text-xs uppercase tracking-widest text-accent-dark mb-2">Editor</p>
        <h2 class="m-0 leading-none">{{ formMode === 'create' ? 'Yeni Transaction' : 'Transaction Düzenle' }}</h2>
      </div>
      <button
        v-if="formMode === 'edit'"
        class="rounded-full py-2.5 px-4 bg-transparent border border-line text-text hover:-translate-y-0.5 transition-all duration-200"
        type="button"
        @click="emit('reset')"
      >
        Yeni kayıt moduna dön
      </button>
    </div>

    <form class="grid gap-3.5" @submit.prevent="emit('submit')">
      <label class="grid gap-2">
        <span class="text-sm text-muted">Property ID</span>
        <input v-model="form.propertyId" placeholder="prop-123" class="w-full border border-line bg-[rgba(255,255,255,0.72)] rounded-xl py-3.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-[rgba(194,91,51,0.2)] focus:border-accent" required />
      </label>

      <label class="grid gap-2">
        <span class="text-sm text-muted">Listing Agent</span>
        <input v-model="form.listingAgent" placeholder="john" class="w-full border border-line bg-[rgba(255,255,255,0.72)] rounded-xl py-3.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-[rgba(194,91,51,0.2)] focus:border-accent" required />
      </label>

      <label class="grid gap-2">
        <span class="text-sm text-muted">Selling Agent</span>
        <input v-model="form.sellingAgent" placeholder="jane" class="w-full border border-line bg-[rgba(255,255,255,0.72)] rounded-xl py-3.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-[rgba(194,91,51,0.2)] focus:border-accent" required />
      </label>

      <label class="grid gap-2">
        <span class="text-sm text-muted">Service Fee</span>
        <input
          v-model.number="form.serviceFee"
          min="0"
          step="100"
          type="number"
          class="w-full border border-line bg-[rgba(255,255,255,0.72)] rounded-xl py-3.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-[rgba(194,91,51,0.2)] focus:border-accent"
          required
        />
      </label>

      <label v-if="formMode === 'edit'" class="grid gap-2">
        <span class="text-sm text-muted">Stage</span>
        <select v-model="form.stage" class="w-full border border-line bg-[rgba(255,255,255,0.72)] rounded-xl py-3.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-[rgba(194,91,51,0.2)] focus:border-accent">
          <option
            v-for="option in stageOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>

      <button class="mt-1 rounded-full py-3.5 px-4.5 bg-gradient-to-br from-accent to-accent-dark text-white hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-65 disabled:cursor-wait" type="submit" :disabled="submitting">
        {{
          submitting
            ? 'Kaydediliyor...'
            : formMode === 'create'
              ? 'Transaction Oluştur'
              : 'Değişiklikleri Kaydet'
        }}
      </button>
    </form>
  </div>
</template>
