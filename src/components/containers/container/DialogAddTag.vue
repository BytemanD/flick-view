<template>
    <v-dialog max-width="600" scrollable>
        <v-card title="添加Tag" :subtitle="props.image.id">
            <v-card-text>
                <v-form ref="form" v-model="card.valid">
                    <v-text-field variant="outlined" clearable v-model="card.tag" placeholder="输入tag"
                        @input="removeSpaces" :rules="card.tagRules" />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn block color="primary" :disabled="!card.tag || !card.valid" @click="addTag">添加</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { reactive } from 'vue';

const props = defineProps({
    image: { type: Object, required: true },
})
const emits = defineEmits(['click:confirm'])

var card = reactive({
    tag: null,
    valid: false,
    tagRules: [
        v => !!v || 'tag不能为空',
        (v) => {
            const regex = /^[a-z0-9]+(:[a-zA-Z0-9._]([a-zA-Z0-9._-]+)?)?$/;
            if (!regex.test(v)) {
                return 'tag不合法';
            }
            let fullValue = v;
            if (fullValue.indexOf(':') < 0) {
                fullValue += ':latest'
            }
            if (props.image.tags.indexOf(fullValue) >= 0) {
                return 'tag 已经存在';
            }
            return true;
        },

    ]
})

function removeSpaces() {
    card.tag = card.tag.replace(/\s/g, '')
}

async function addTag() {
    emits('click:confirm', { id: props.image.id, tag: card.tag.trim() })
    card.tag = null;
}

</script>