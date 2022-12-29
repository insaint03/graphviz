<template>
  <v-app id="graphViz">
    <!-- 
    <v-navigation-drawer app class="pt-4" color="grey lighten-3" mini-variant v-model="showNavigation">
      <v-avatar v-for="r in routes" :key="`nav-route.${r.name}`" size="32" class="d-block text-center mx-auto mb-9">
        <v-icon>{{ r.icon }}</v-icon>
      </v-avatar>
    </v-navigation-drawer>
    -->

    <v-main>
      <v-container fluid fill-height>
        <v-row>
          <v-col>
            <router-view />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
<script>
import routes from '@/plugins/router/routes'


export default {
  name: 'ApplicationMain',
  data() {
    return {
      // showNavigation: true,
      routes,
    }

  }
}

</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
