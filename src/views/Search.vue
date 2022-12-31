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
            return (0<level) 
                ? (this.selecteds[level-1] || {})._child.filter((c)=>c._type==this.keys.category)
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
            // console.log('extent', ev.target.data());
            let target = ev.target.data();
            if(target._child.length<=0) return;
            let exts = [].concat(this.extensions);
            exts.push(target);

            this.extensions = exts.filter((_,len)=>len<extensionThreshold);
        },
        removeExtent(item) {
            this.extensions = this.extensions.filter((ex)=>ex.id!=item.id);
        },

        appendNodes(node) {
            return node ? [node].concat(node._child) : [];
        },
        appendAffiliations(node) {
            return node ? node._child.map((child) => {
                return {
                    source: node.id,
                    target: child.id,
                };
            }) : [];
        },
        trackParent(node) {
            let theName =  node._type === this.keys.class ? node.subClassOf : node.type;
            console.log(`${node.id} > ${theName}`);
            return theName ? this.categories[theName] : null;
        },
        track(node) {
            let ancestors = [];
            let cs = node;
            do {
                if(cs._type!==this.keys.entity) {
                    ancestors.push(cs);
                }
                console.log('a',cs,cs._type!==this.keys.entity,ancestors);
                cs = this.trackParent(cs);
            } while(cs);
            console.log("an", node, ancestors);
            let sels = ancestors.reverse();
            this.cursor = sels[sels.length-1];
            this.selecteds = sels.concat([null]);
            this.extensions = [];
        }
    },
    watch: {
        // selecteds() {
        //     console.log(this.nodes, this.links);
        // }
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
                let nids = ns.map((n)=>n.id);
                ns.push(...this.appendNodes(ex)
                    .filter((ex)=>!nids.includes(ex.id)));
            });
            return ns;
        },
        links() {
            if(this.cursor) {
                let ls = this.appendAffiliations(this.cursor);

                this.extensions.forEach((ex)=>{
                    ls.push(...this.appendAffiliations(ex));
                });
                return ls;
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
            extensions: [],
            ...dataset,
        };
    }
}
</script>