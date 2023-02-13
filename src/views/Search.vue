<template>
    <v-card elevation="3">
        <v-card-title>
            <v-toolbar extended elevation="0" class="mx-0 navigation-tools">
                <template v-for="si in (0,hierarchy_levels)">
                    <v-col cols="2" :key="`search-nav.category.${si}.${stamped}`" 
                        align-self="stretch" class="flex-grow-2 ma-0 pa-1">
                        <chip-menu v-model="selecteds[si-1]"
                            :alt="selecteds[si-1] ? selecteds[si-1].id : '-'"
                            :options="siblings[si-1]" 
                            :level="si-1" @change="choose" />
                    </v-col>
                </template>
                <v-col cols="4" :key="`search-nav.entity.${stampq}`"
                    align-self="stretch" class="flex-grow-4 ma-0 pa-1">
                    <search-menu v-model="query" :items="items" @select="track" />
                </v-col>
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

const initializes = [
    '방송',
    '기기',
    '사용기기',
]

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
        refreshQuery() {
            this.stampq = Date.now();
        },
        choose(ev) {
            // update selecteds
            this.selecteds = this.selecteds.map((sel,lv)=>{
                if(lv==ev.level) {
                    return ev.value;
                }
                else if(lv<ev.level) {
                    return sel;
                } else {
                    return null; 
                }
            });
            // clear extensions
            this.extensions = [];
            // clear query
            this.query = null;
            this.refreshQuery();
            // update cursor setup
            this.cursor = ev.value;
        },
        extent(ev) {
            let target = ev.target.data();
            let exts = [];
            // on extending entity - refresh egonet
            if(target._type === this.keys.entity) {
                this.extensions = [];
                this.cursor = target;
            } else {
                exts = [].concat(this.extensions);
                exts.push(target);
                // cut off from start
                while(extensionThreshold<exts.length) {
                    exts.shift();
                }
                this.extensions = exts;
            }
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

            let nexts = [node].concat(node._child || []);

            // entity class
            if(node._type === this.keys.entity) {
                // appending props
                nexts.push(...(node._props || []));
                // appending the class
                nexts.push(this.categories[node.type]);
            } 
            return nexts;
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
            return node
                ? (node.type || node.subClassOf)
                : null;
        },
        track(node) {
            let ancestors = [];
            // re-select
            // node = this.entities[node.id];
            let cs = node;
            let max = this.hierarchy_levels+1;
            do {
                let _pk = this.trackParent(cs);
                if(!_pk) break;
                // up and up
                cs = this.categories[_pk];
                if(!cs) break;
                // push ancestors
                ancestors.push(cs);
                // to prevent infinite loop
                console.log(max, _pk, cs);
                max -= 1;
            } while(cs && 0<=max);

            ancestors.reverse();
            let sels = new Array(this.hierarchy_levels).fill(null);
            ancestors.forEach((p,i)=>sels[i]=p);
            // update selecteds
            this.selecteds = sels;
            this.extensions = [];
            this.query = node._name;
            // refresh all
            this.cursor = node;
        }
    },
    watch: {
        cursor() {
            if(this.cursor._type === this.keys.entity) {
                this.query = this.cursor._name;
            } 
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
        }, 
        siblings() {
            let stems = this.selecteds
                .filter((_,lv)=>lv+1<this.hierarchy_levels)
                .map((se)=>{
                    try { 
                        return (se._child || [])
                            .filter((ch)=>ch._type == this.keys.category); 
                    }
                    catch{ return []; }
                });
            stems = [this.hierarchy].concat(stems);
            return stems;
        },
        items() {
            // find latest item
            let latest = this.selecteds.reduce((g,sel)=>{
                return sel || g || null;
            }, null);
            //
            if(latest==null) {
                return Object.values(this.entities);
            }
            //
            let items = [];
            let stacks = [latest];
            while(0<stacks.length) {
                let cursor = stacks.shift();

                // append items
                items.push(...this.childs_of(cursor, this.keys.entity));
                // append sub categories
                stacks.push(...this.childs_of(cursor, this.keys.category));
            }

            // console.log('selected', latest, items);

            return items;
        }
    },
    mounted() {
        this.selecteds = initializes.map((_id)=>this.categories[_id] || this.entities[_id] || null)
            .filter((v)=>v!=null);
        // this.cursor = this.selecteds[-1];
        this.cursor = this.selecteds[this.selecteds.length-1];
    },
    data() {
        return {
            searches: '',
            selecteds: new Array(dataset.hierarchy_levels).fill(null),
            stamped: Date.now(),
            stampq: Date.now(),
            cursor: null,
            extensions: [],
            query: null,
            ...dataset,
        };
    }
}
</script>