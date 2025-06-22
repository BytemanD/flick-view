<template>
    <v-responsive class="border rounded">
        <v-app>
            <v-navigation-drawer :rail="navigation.mini">
                <v-list>
                    <v-list-item prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
                    subtitle="sandra_a88@gmailcom" title="Sandra Adams"></v-list-item>
                </v-list>

                <v-divider></v-divider>
                
                <v-list density="compact" nav>
                    <v-list-item title="Python Manager" value="myfiles" prepend-icon="mdi-home">
                    </v-list-item>
                </v-list>
            </v-navigation-drawer>
            <v-app-bar >
                <v-app-bar-nav-icon @click="navigation.mini = !navigation.mini"
                    :icon="navigation.mini ? 'mdi-dots-vertical' : 'mdi-menu'">
                </v-app-bar-nav-icon>
            </v-app-bar>
            <v-main>
                <v-row>
                    <v-col class="pa-6">
                        <PythonPackages />
                    </v-col>
                </v-row>
            </v-main>
        </v-app>
    </v-responsive>
</template>

<script setup>
import API from '@/assets/app/api';
import { ref } from 'vue';


var navigation = ref({
    mini: false,
})

</script>
