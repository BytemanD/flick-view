<template>
    <v-table density="compact">
        <tbody>
            <template v-for="(value, key) in props.object">
                <tr v-if="!key.startsWith('_')">
                    <th>
                        <h4>{{ key }}</h4>
                    </th>
                    <td>{{ value }}</td>
                </tr>
            </template>
        </tbody>
    </v-table>
</template>

<script setup>

const props = defineProps({
  object: { type: Object, reauired: true },
})

</script>