<template>
    <v-responsive class="border rounded">
        <v-app>
            <v-navigation-drawer :rail="navigation.mini">
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
                        :value="index" @click="selectItem(index)" color="info">
                    </v-list-item>
                </v-list>
            </v-navigation-drawer>
            <v-app-bar>
                <v-app-bar-nav-icon @click="navigation.mini = !navigation.mini"
                    :icon="navigation.mini ? 'mdi-dots-vertical' : 'mdi-menu'">
                </v-app-bar-nav-icon>
            </v-app-bar>
            <v-main>
                <v-col>
                    <PythonPackages v-if="navigation.selectedIndex == 0" />
                    <docker-manager v-if="navigation.selectedIndex == 1" />
                </v-col>
            </v-main>
        </v-app>
    </v-responsive>
</template>

<script setup>
import { reactive, ref } from 'vue';


var components = [
    { title: 'Python Manager', icon: "mdi-alpha-p-circle", component: 'PythonPackages' },
    { title: 'Docker Manager', icon: "mdi-alpha-d-circle", component: 'DockerManager' },
]

var navigation = reactive({
    mini: false,
    selectedIndex: 0,
})

function selectItem(index) {
    navigation.selectedIndex = index;
}

</script>
