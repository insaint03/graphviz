<template>
    <div ref="canvas" id="vgraph" />
</template>
<script>
import cytoscape from 'cytoscape'
import cola from 'cytoscape-cola';
import popper from 'cytoscape-popper';

cytoscape.use( cola );
cytoscape.use( popper );



const canvasStyles = {
    'node': {
        label: 'data(id)',
        'text-valign': 'center',
        'text-halign': 'center',
    },
    'node[_type="Class"]': {
        'background-color': '#eee',
        'border-width': '2px',
        'border-color': '#ccc',
        'font-size': 10,
    },
    'node[_type="NamedIndividual"]' : {
        'background-color': '#ccc',
        label: 'data(id)',
        'border-width': '0px',
        'font-size': 8,
        tooltip: (node)=>JSON.stringify(node.data),
    },
    edge: {
        width: .5,
        'line-color': '#eee',
        'target-arrow-color': '#eee',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        // label: 'data(label)',
        "edge-text-rotation": "autorotate",
        'line-width': '1px',
        'font-size': 6,
    },
}

const layoutOptions = {
    cola: {
        name: 'cola',
        // refresh: 1,
        convergenceThreshold: 0.025,
    },
}

export default {
    name: 'v-graph',
    props: {
        nodes: Array,
        links: Array,
    },
    methods: {
        layouts() {
            let options = layoutOptions.cola;
            options.refresh = Math.max(1, Math.ceil(Math.log2(this.nodes.length)));
            this.graph.layout(options).run();
        },
        onNodeDragOut(ev) {
            this.layouts();
            console.log(ev);
        },
        onNodeHover(ev) {
            this.$emit('hover', ev);

        },
        onNodeDoubleClicked(ev) {
            // let source = ev.target.id();
            // let target = source + '`';
            // this.graph.add([
            //     {group: 'nodes', data: {id: target}},
            //     {group: 'edges', data: {source, target}},
            // ]);
            // this.layouts();
            this.$emit('extend', ev);
        }
    },
    mounted() {
        // this.graph.add(samples);

        this.graph.mount(this.$refs.canvas);
        this.layouts();
        // this.graph.layout({name: 'cola'}).run();

        this.graph.on('tapdragout', 'nodes', this.onNodeDragOut);
        this.graph.on('hover', 'nodes', this.onNodeHover);
        this.graph.on('dblclick', 'nodes', this.onNodeDoubleClicked);
        // this.graph.((n)=>{
        //     console.log(n);
        //     _bindPopper(n);
        // })
    },
    computed: {
    },
    data() {
        let ns = this.nodes.map((n)=>{return {data: n}});
        let ls = this.links.map((l)=>{return {data: l}});


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