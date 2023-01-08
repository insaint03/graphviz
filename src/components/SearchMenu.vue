<template>
    <v-menu offset-y>
        <template #activator="{on,attrs}">
            <v-text-field
                hide-details
                append-icon="mdi-magnify"
                single-line
                v-model.lazy="searches"
                v-on="on"
                v-bind="attrs">
            </v-text-field>
        </template>
        <v-list dense style="max-height: 50vh; overflow-y:auto;">
            <v-list-item v-for="(item,idx) in tree" :key="`search-menu.query.${idx}`"
                v-show="test(item[keySearch])"
                @click="$emit('select', item)">
                <v-list-item-title :style="`padding-left: ${8*item._indent}px`">
                    {{ item[keySearch] }}
                </v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>

</template>

<script>
export default {
    name: 'SearchMenu',
    props: {
        items: {type: Array, required:true},
        keyChild: {type: String, default: '_child'},
        keySearch: {type:String, default: 'id'},
    },
    methods: {
        test(value) {
            return this.filter ? this.filter.test(value) : false;
        },
    },
    mounted() {
        let stack = [].concat(this.items);
        let rss = [];

        while(0<stack.length) {
            let cursor = stack.shift();
            let children = cursor[this.keyChild];
            
            cursor._indent = cursor._indent || 0;
            rss.push(cursor);
            // prepand children
            if(children && 0<children.length) {
                children.forEach((ch)=>{
                    ch._indent = cursor._indent + 1;
                });
                stack = children.concat(stack);
            }
        }
        this.tree = rss;
    },
    computed: {
        filter() {
            return this.searches ? new RegExp(this.searches, RegExp.I) : null;
        }
    },
    data() {
        return {
            query: null,
            searches: null,
            tree: [],
        }
    },
}
</script>
