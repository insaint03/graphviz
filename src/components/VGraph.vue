<template>
    <div ref="canvas" id="vgraph" />
</template>
<script>
import cytoscape from 'cytoscape'
import cola from 'cytoscape-cola';

cytoscape.use( cola );

const canvasStyles = {
    node: {
        'background-color': '#e0e0e',
        label: 'data(id)',
        'text-valign': 'center',
        'text-halign': 'center',
    },
    edge: {
        width: 3,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        label: 'data(label)',
        "edge-text-rotation": "autorotate"
    },
}
// const samples = [
//     {group: 'nodes', data: {id: 'A', label: 'A'}},
//     {group: 'nodes', data: {id: 'B', label: 'B'}},
//     {group: 'nodes', data: {id: 'C', label: 'C'}},
//     {group: 'nodes', data: {id: 'D', label: 'D'}},
//     {group: 'edges', data: {source: 'A', target: 'B', label: 'lab'}},
//     {group: 'edges', data: {source: 'A', target: 'C', label: 'lab'}},
//     {group: 'edges', data: {source: 'B', target: 'D', label: 'lab'}},
//     {group: 'edges', data: {source: 'C', target: 'B', label: 'lab'}},
// ];

export default {
    name: 'v-graph',
    props: {
        nodes: Array,
        links: Array,
    },
    methods: {
        layouts() {
            this.graph.layout({name: 'cola'}).run();
        },
        onNodeDragOut(ev) {
            this.layouts();
            console.log(ev);
        },
        onNodeDoubleClicked(ev) {
            let source = ev.target.id();
            let target = source + '`';
            this.graph.add([
                {group: 'nodes', data: {id: target}},
                {group: 'edges', data: {source, target}},
            ]);
            this.layouts();
        }
    },
    mounted() {
        // this.graph.add(samples);

        this.graph.mount(this.$refs.canvas);
        this.layouts();
        // this.graph.layout({name: 'cola'}).run();

        this.graph.on('tapdragout', 'nodes', this.onNodeDragOut);
        this.graph.on('dblclick', 'nodes', this.onNodeDoubleClicked);
    },
    computed: {
    },
    data() {
        let ns = this.nodes.map((n)=>{return {data: {id: n}}});
        let ls = this.links.map(([source,target])=>{ return {data: {source,target}}});


        return {
            graph: cytoscape({
                // container: this.$refs.vgraph ,
                elements: ns.concat(ls),
                style: Object.entries(canvasStyles).map(([selector, style])=>{
                    return {selector, style}
                }),
            }),
        }
    }
}
</script>

<style scoped>
div#vgraph {
    min-height: 800px;
    min-width: 600px;
}
div#vgraph {
    width: 100%;
    height: 100%;
}
</style>