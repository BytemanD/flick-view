<template>
    <v-dialog max-width="800" scrollable>
        <v-card :title="props.package.name">
            <v-divider></v-divider>
            <v-card-subtitle>路径:{{props.package.path}}</v-card-subtitle>
            <v-card-text>
                <v-textarea v-model="props.package.metadata" rows="24" readonly>
                </v-textarea>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup>

const props = defineProps({
    package: { type: Object, required: true, },
})

</script>