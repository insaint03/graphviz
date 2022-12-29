<template>
    <v-menu offset-x>
        <template #activator="{on, attrs}">
            <v-chip color="primary" dark v-bind="attrs" v-on="on">
                {{label}}
                <v-icon v-if="0<options.length">mdi-menu-down</v-icon>
            </v-chip>
        </template>
        <v-list dense>
            <v-list-item v-for="(nxt,ni) in options" :key="`selected-chip.${label}.${ni}`"
                @click="choose(nxt)">
                <v-list-item-title>{{nxt._name}} ({{nxt._child.length}})</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>
<script>
const nodeCountThreshold = 200;
const tooManyWarning = '대량의 데이터 시각화로 인하여 지연될 수 있습니다. 계속하시겠습니까?';

export default {
    name: 'ChipMenu',
    props: {
        options: Array,
        level: Number,
    },
    computed: {
        label() {
            return this.value ? this.value._name || '' : '';
        },
        countChildren() {
            return this.value && this.value._child ? `(${this.value._child.length})` : '';
        }
    },
    methods: {
        choose(target) {
            if(target._child.length < nodeCountThreshold || confirm(tooManyWarning)) {
                this.value = target;
                this.$emit('change', {value: target, level: this.level});
            }
        }
    },
    data() {
        return {
            value: null
        }
    }
}
</script>
<style>
</style>