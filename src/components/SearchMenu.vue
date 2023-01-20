<template>
    <v-menu offset-y>
        <template #activator="{on,attrs}">
            <v-text-field
                hide-details
                append-icon="mdi-magnify"
                single-line
                v-model="value"
                v-on="on"
                v-bind="attrs">
            </v-text-field>
        </template>
        <v-list dense style="max-height: 50vh; overflow-y:auto;">
            <v-list-item v-for="(item,idx) in items" :key="`search-menu.query.${idx}`"
                v-show="test(item[keySearch])"
                @click="onSelect(item)">
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
            return this.filter 
                ? this.filter.test(value) 
                : true;
        },
        onSelect(item) {
            console.log('on select', item);
            // set name
            this.value = item._name;
            // emit item name
            this.$emit('select', item);
        }
    },
    watch: {
        filter() {
            if(this.runningLock) { return; }
            // copy filter
            this.filter_saved = this.filter;
            this.runningLock = true;
            // release lock after .1 seconds
            setTimeout(()=>{
                this.runningLock = false;
            }, 100);
        }
    },
    computed: {
        filter() {
            if(this.runningLock) {
                return this.filter_saved;
            }
            return new RegExp(this.value || '.*', RegExp.I);
        }
    },
    data() {
        return {
            query: null,
            value: null,
            runningLock: false,
            filter_saved: /.*/i,
        }
    },
}
</script>
