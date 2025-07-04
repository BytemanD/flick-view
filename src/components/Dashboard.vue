<template>
    <v-responsive class="border rounded">
        <v-app>
            <v-navigation-drawer :rail="navigation.mini" width="200">
                <v-list>
                    <v-list-item subtitle="guest@gmailcom" title="Guest">
                        <template v-slot:prepend>
                            <v-avatar image="@/assets/logo.svg" rounded="0"></v-avatar>
                        </template>
                    </v-list-item>
                </v-list>
                <v-divider></v-divider>
                <v-list density="compact" nav>
                    <v-list-item v-for="(item, index) in components" :title="item.title" :prepend-icon="item.icon"
                        :value="index" @click="selectItem(index)" color="info"
                        :active="navigation.selectedIndex == index">
                    </v-list-item>
                </v-list>
            </v-navigation-drawer>
            <v-app-bar>
                <v-app-bar-nav-icon @click="navigation.mini = !navigation.mini"
                    :icon="navigation.mini ? 'mdi-dots-vertical' : 'mdi-menu'">
                </v-app-bar-nav-icon>
                <v-spacer></v-spacer>
                <btn-theme></btn-theme>
            </v-app-bar>
            <v-main>
                <v-col>
                    <component v-if="navigation.loginSuccess" :is="components[navigation.selectedIndex].component" />
                </v-col>
            </v-main>
        </v-app>
    </v-responsive>
</template>

<script setup>
import { reactive } from 'vue';

import PythonPackages from '@/components/containers/PythonPackages.vue'
import DockerManager from '@/components/containers/container/DockerManager.vue'
import SystemManager from '@/components/system/SystemManager.vue'

import SES from '@/assets/app/sse'
import API from '@/assets/app/api';
import notify from '@/assets/app/notify';

var components = [
    { title: '系统', icon: "$server", component: SystemManager },
    { title: 'Python', icon: "$python", component: PythonPackages },
    { title: 'Docker', icon: "$docker", component: DockerManager },
]

var navigation = reactive({
    mini: false,
    selectedIndex: 0,
    loginSuccess: false
})

function selectItem(index) {
    navigation.selectedIndex = index;
    localStorage.setItem('navigationIndex', navigation.selectedIndex)
}

function initNaigation() {
    let savedIndex = localStorage.getItem('navigationIndex')
    if (savedIndex && savedIndex > 0 && savedIndex < components.length) {
        navigation.selectedIndex = savedIndex
    } else {
        navigation.selectedIndex = 0
    }
}


API.auth.login().then((data) => {
    SES.listen(data.session_id)
    navigation.loginSuccess = true;
    initNaigation()
}).catch((e)=> {
    console.error('login failed', e)
    notify.error('login failed')
})

</script>
