<template>
    <v-card elevation="0" >
        <v-toolbar floating class="mx-2">
            <v-spacer />
            <v-text-field
            hide-details
            prepend-icon="mdi-magnify"
            single-line
            v-model="searches"
            ></v-text-field>
            <v-spacer />
            <v-toolbar-items>
                <v-chip-group>
                    <chip-menu v-for="_,si in selecteds" 
                        :key="`search-tool.category.${si}`"
                        v-model="selecteds[si]"
                        :options="siblings(si)"
                        :level="si"
                        @change="choose"
                    />
                </v-chip-group>
            </v-toolbar-items>
        </v-toolbar>
        <v-graph :links="links" :nodes="nodes" :key="`search-card.${stamped}`"></v-graph>

    </v-card>
</template>
<script>
import dataset from '@/datasource'
import VGraph from '@/components/VGraph.vue';
import ChipMenu from '@/components/ChipMenu.vue'

export default {
    name: 'SearchScreen',
    components: {
        VGraph,
        ChipMenu,
    },
    methods: {
        siblings(level) {
            return (0<level) 
                ? this.selecteds[level-1]._child.filter((c)=>c._type=='Class')
                : this.hierarchy;
        },
        choose(ev) {
            let sels = [];
            for(let i=0; i<=ev.level; i++) {
                sels.push((i==ev.level && ev.value) 
                    ? ev.value 
                    : this.selecteds[i]);
            }
            // children
            let children = ev.value._child.filter((c)=>c._type=='Class');
            if(0<children.length) {
                sels[ev.level+1] = children[0];
            }
            this.selecteds = sels;
            this.cursor = ev.value;
            this.stamped = Date.now();
        }
    },
    watch: {
        selecteds() {
            console.log(this.nodes, this.links);
        }
    },
    computed: {
        menu_roots() {
            return this.hierarchy;
        },
        nodes() {
            if(this.cursor) {
                return ([this.cursor].concat(this.cursor._child))
                    .map((n)=>{
                        return Object.assign({id: n._name,}, n)
                    });
            } else {
                return [];
            }
        },
        links() {
            if(this.cursor) {
                let affiliations = this.cursor._child.map((tg)=>{
                    return {source: this.cursor._name, target: tg._name};
                });
                let proximities = this.properties.reduce((g, pr)=>{
                    this.nodes.forEach((n,ni)=>{
                        let pk = pr._name;
                        let pv = n[pk];
                        let label = `${pk} = ${pv}`;
                        if(pv!=null) {
                            this.nodes.forEach((q,qi)=>{
                                if(ni<=qi) return;
                                if(pv === q[pk]) {
                                    g.push({source: n._name, target: q._name, property: pk, value: pv, label, });
                                }
                            });
                        }
                    });
                    return g;
                }, []);
                return affiliations.concat(proximities);
            } else {
                return [];
            }
        }
    },
    mounted() {
        this.selecteds = [this.hierarchy[0]];
        // this.choose({
        //     value: this.hierarchy[0],
        //     level: 0
        // });
    },
    data() {
        return {
            searches: '',
            selecteds: [],
            stamped: Date.now(),
            cursor: null,
            ...dataset,
        };
    }
}
</script>