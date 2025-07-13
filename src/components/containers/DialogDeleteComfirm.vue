<template>
  <v-dialog width="600" scrollable persistent>
    <template v-slot:activator="{ props }">
      <v-btn v-if="!hideBtn" v-bind="props" :variant="variant" :density="density" icon="mdi-trash-can" color="red"
        :disabled="disabledBtn"></v-btn>
    </template>
    <v-card color="blue-grey-darken-2">
      <v-card-title class="text-red" icon="mdi-alert">{{ title }}</v-card-title>
      <v-card-text>
        <p>{{ text }}</p>
        <ol v-if="items.length > 0" class="ml-6">
          <li v-for="(item, index) in items" :key="index">{{ item }}</li>
        </ol>
        <v-switch v-if="showForceDelete" v-model="options.force" label="强制删除" color="warning"></v-switch>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-row>
          <v-col class="pa-2">
            <v-btn block color='info'
              @click="() => { emits('update:modelValue', false); emits('click:cancel') }">取消</v-btn>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col class="pa-2">
            <v-btn block color="red"
              @click="() => { emits('update:modelValue', false); emits('click:comfirm', options) }">确定</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { reactive } from 'vue'

const emits = defineEmits(['update:modelValue', 'click:comfirm', 'click:cancel'])
const props = defineProps({
  title: { type: String, default: '确认删除?' },
  variant: { type: String, default: "text" },
  density: { type: String, default: "default" },
  text: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  disabledBtn: { type: Boolean, default: false },
  hideBtn: { type: Boolean, default: false },
  showForceDelete: { type: Boolean, default: false, required: false },
})

var options = reactive({
  force: false,
})


</script>
