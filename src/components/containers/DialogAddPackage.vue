<template>
    <v-dialog max-width="600" v-model="display" scrollable>
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="primary" icon='mdi-plus' variant="text"></v-btn>
        </template>
        <v-card title="添加Python包">
            <v-progress-linear :model-value="props.progress" :max="card.packages.length" color="success"></v-progress-linear>
            <v-card-text>
                <v-row>
                    <v-col>
                        <v-textarea clearable variant="outlined" v-model="card.text" rows="10"
                            placeholder="请输入包名(多个包换行)" :rules="card.rules"/>
                    </v-col>
                    <v-col cols="4" class="d-flex flex-column justify-end pb-6">
                        <v-switch hide-details flat density="compact" v-model="card.upgrade" label="升级"
                            color="info"></v-switch>
                        <v-switch hide-details flat density="compact" v-model="card.noDeps" label="忽略依赖"
                            color="warning"></v-switch>
                        <v-switch hide-details flat density="compact" v-model="card.force" label="强制安装"
                            color="error"></v-switch>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-btn block color="primary" :disabled="card.packages.length == 0 || card.error"
                    @click="install">安装</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { reactive, ref } from 'vue';

var display = ref(false)
const props = defineProps({
  progress: { type: Number, default: 0 },
})

const emits = defineEmits(['update:modelValue', 'click:confirm'])

var card = reactive({
    text: '',
    messages: '',
    noDeps: false,
    force: false,
    upgrade: false,
    error: false,
    rules: [
        // v => !!v || '内容不能为空',
        v => validate(v),
    ],
    packages: [],
    progress: 0,
})
function validate(value) {
    card.packages = [];
    let packages = value.split('\n').map(item => item.trim()).filter(item => item);
    for (let i = 0; i < packages.length; i++) {
        if (!packages[i].match(/^[a-zA-Z0-9\-_]+$/)) {
            card.error = true;
            return `包名 "${packages[i]}" 格式错误`
        }
    }
    card.packages = packages;
    card.error = false;
    return true;
}
async function install() {
    if (card.packages.length == 0 || card.error) {
        return;
    }
    emits('click:confirm', card.packages, { noDeps: card.noDeps, force: card.force, upgrade: card.upgrade });
}

</script>