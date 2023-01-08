<template>
    <v-card elevation="3">
        <v-card-title>
            <v-toolbar dark extended elevation="0" class="mx-0">
                <v-toolbar-items>
                    <chip-menu v-for="_,si in selecteds" 
                        :key="`search-tool.category.${si}`"
                        v-model="selecteds[si]"
                        :options="siblings(si)"
                        :level="si"
                        @change="choose"
                    />
                </v-toolbar-items>
                <v-spacer />
                <search-menu :items="hierarchy"
                    @select="track" />
                <template #extension>
                    <v-chip-group>
                        <v-chip outlined><v-icon>mdi-plus</v-icon></v-chip>
                        <v-chip v-for="ex,ei in extensions"
                            :key="`search-tool.extent.${ei}-${ex.id}`"
                            close @click:close="removeExtent(ex)">
                            {{ ex.id }}
                        </v-chip>
                    </v-chip-group>
                </template>
            </v-toolbar>
        </v-card-title>
        <v-row>
            <v-col>
                <v-graph :key="`search-card.${stamped}`"
                    :nodes="nodes" :links="links"  
                    @extend="extent"
                    @hover="(ev)=>window.console.log(ev.target.data())"
                    style="height:100%"
                ></v-graph>
            </v-col>
        </v-row>
    </v-card>
</template>
<script>
const extensionThreshold = 3;
import dataset from '@/datasource'
import VGraph from '@/components/VGraph.vue';
import ChipMenu from '@/components/ChipMenu.vue'
import SearchMenu from '@/components/SearchMenu.vue'

export default {
    name: 'SearchScreen',
    components: {
        VGraph,
        ChipMenu,
        SearchMenu,
    },
    methods: {
        refreshGraph() {
            this.stamped = Date.now();
        },

        siblings(level) {
            return 0===level ? this.hierarchy
                : (this.selecteds[level-1] || {})
                    ._child.filter((c)=>c._type==this.keys.category);
        },
        choose(ev) {
            let sels = [];
            for(let i=0; i<=ev.level; i++) {
                sels.push((i==ev.level && ev.value) 
                    ? ev.value 
                    : this.selecteds[i]);
            }
            // children
            let children = ev.value._child.filter((c)=>c._type==this.keys.category);
            if(0<children.length) {
                sels[ev.level+1] = null;
            }
            this.selecteds = sels;
            this.cursor = ev.value;
            // clear extensions
            this.extensions = [];
        },
        extent(ev) {
            let target = ev.target.data();
            let extension = (target._child || []).length + (target._props || []).length;
            if(extension <=0)
                return;
            let exts = [].concat(this.extensions);
            exts.push(target);

            this.extensions = exts.filter((_,len)=>len<extensionThreshold);
        },
        removeExtent(item) {
            this.extensions = this.extensions.filter((ex)=>ex.id!=item.id);
        },
        dataEntries(item) {
            return Object.entries(item)
                .filter(([k,])=>/^(_.+|type)/.test(k));
        },
        appendNodes(node) {
            if(!node) return [];
            let nexts = (node._child || []).concat(node._props || [])
            return [node].concat(nexts);
        },
        appendAffiliations(node) {
            if(!node) return [];
            let nexts = (node._child || []).concat(node._props || []);
            return nexts.map((x)=>{
                return {
                    source: node.id,
                    target: x.id,
                }
            });
        },
        trackParent(node) {
            let theName =  node._type === this.keys.class ? node.subClassOf : node.type;
            return theName ? this.categories[theName] : null;
        },
        track(node) {
            let ancestors = [];
            let cs = node;
            let max = 4;
            do {
                if(cs._type===this.keys.class) {
                    ancestors.push(cs);
                } 
                cs = this.trackParent(cs);
            } while(cs && 0<=max);
            let sels = ancestors.reverse();
            this.cursor = sels[sels.length-1];
            this.selecteds = sels.concat([null]);
            this.extensions = [];
        }
    },
    watch: {
        cursor() {
            this.refreshGraph();
        },
        extensions() {
            this.refreshGraph();
        }
    },
    computed: {
        menu_roots() {
            return this.hierarchy;
        },
        nodes() {
            // with cursor
            let ns = this.appendNodes(this.cursor);
            this.extensions.forEach((ex)=>{
                let nids = ns.map(this.to_string);
                ns = ns.concat(this.appendNodes(ex).filter((ex)=>!nids.includes(this.to_string(ex))));
            });
            return ns;
        },
        links() {
            return this.nodes
                // reducing property sources
                .filter((node)=>node._type!==this.keys.property)
                .reduce((gg, src)=>{
                let nexts = (src._child || []).concat(src._props || []);
                return gg.concat(this.nodes.filter((trg)=>src!==trg && nexts.includes(trg))
                    .map((trg) => {
                        return {
                            source: src.id,
                            target: trg.id,
                        }
                    }));
            }, []);
        }
    },
    mounted() {
        this.selecteds = [this.hierarchy[0]];
    },
    data() {
        return {
            searches: '',
            selecteds: [],
            stamped: Date.now(),
            cursor: null,
            extensions: [],
            ...dataset,
        };
    }
}
</script>