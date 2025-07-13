<template>
    <v-chip class="rounded-te-0 rounded-be-0 pr-1" color="info">{{ values.length >= 1 ? values[0] : "" }}</v-chip>
    <v-chip class="rounded-ts-0 rounded-bs-0 pl-1" :closable="closable" color="grey">{{ values.length >= 2 ? values[1] : "" }}

        <template v-if="closable" #close>
            <v-btn class="ml-1" icon="mdi-close-circle" size="default" variant="plain" color="red"
                @click="(e) => onClick(e)"></v-btn>
        </template>

    </v-chip>

</template>
<script setup>

const props = defineProps({
    closable: {type: Boolean, default: false },
    values: { type: Array, required: true },
})
const emits = defineEmits(['click'])

function onClick(e) {
    emits('click', e)
}


</script>