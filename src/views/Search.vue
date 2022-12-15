<template>
    <v-card elevation="0">
        <v-toolbar dense floating class="mx-2">
            <v-text-field
                hide-details
                prepend-icon="mdi-magnify"
                single-line
                v-model="searches"
            ></v-text-field>

            <v-btn icon>
                <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
        </v-toolbar>
        <v-graph :links="links" :nodes="nodes"></v-graph>
    </v-card>
</template>
<script>
import VGraph from '@/components/VGraph.vue';

const sampleLinks = [[1,2],[1,3],[1,4],[1,5],[2,4]];

export default {
    name: 'SearchScreen',
    components: {
        VGraph,
    },
    data() {
        return {
            links: sampleLinks,
            nodes: sampleLinks.reduce((agg, [src,trg])=>{
                if(!agg.includes(src)) agg.push(src);
                if(!agg.includes(trg)) agg.push(trg);
                return agg;
            }, []),
            searches: '',
        };
    }
}
</script>