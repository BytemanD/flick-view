<template>
  <v-dialog v-model="modelValue" width="600" scrollable persistent>
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
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-row>
          <v-col class="pa-2" >
            <v-btn block color='info' @click="() => {emits('update:modelValue', false); emits('click:cancel')}">取消</v-btn>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col class="pa-2">
            <v-btn block color="red" @click="() => {emits('update:modelValue', false); emits('click:comfirm')}">确定</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>

import { ref } from 'vue'

const modelValue = ref(false);

const emits = defineEmits(['update:modelValue', 'click:comfirm', 'click:cancel'])
const props = defineProps({
  title: { type: String, default: '确认删除?' },
  variant: { type: String, default: "text" },
  density: { type: String, default: "default" },
  text: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  disabledBtn: { type: Boolean, default: false },
  hideBtn: { type: Boolean, default: false },
})

function getItemValue(item) {
  if (props.itemValueFunc) {
    return props.itemValueFunc(item)
  }
  if (typeof item == 'object') {
    return item.name || item.id
  }
  return item
}

</script>
