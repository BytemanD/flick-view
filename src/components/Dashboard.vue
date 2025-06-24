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
                    <v-list-item title="Python Manager" value="pythonManager">
                        <template v-slot:prepend>
                            <v-img :width="22" src="/python.svg" class="mr-5"></v-img>
                        </template>
                    </v-list-item>
                </v-list>
            </v-navigation-drawer>
            <v-app-bar>
                <v-app-bar-nav-icon @click="navigation.mini = !navigation.mini"
                    :icon="navigation.mini ? 'mdi-dots-vertical' : 'mdi-menu'">
                </v-app-bar-nav-icon>
            </v-app-bar>
            <v-main>
                <v-row>
                    <v-col class="pa-6">
                        <v-img src=""></v-img>
                        <PythonPackages />
                    </v-col>
                </v-row>
            </v-main>
        </v-app>
    </v-responsive>
</template>

<script setup>
import { ref } from 'vue';


var navigation = ref({
    mini: false,
})

</script>
