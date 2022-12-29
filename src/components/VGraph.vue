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
        label: 'data(_name)',
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
        label: 'data(_name)',
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
        label: 'data(label)',
        "edge-text-rotation": "autorotate",
        'line-width': '1px',
        'font-size': 6,
    },
}

// const _bindPopper = function(target) {
//     console.log(target);
//     let tooltipId = `popper-target-${target.id()}`;
//     let existingTarget = document.getElementById(tooltipId);
//     if (existingTarget && existingTarget.length !== 0) {
//         existingTarget.remove();
//     }

//     let popper = target.popper({
//         content: () => {
//             // create div container
//             let tooltip = document.createElement('div');
//             tooltip.textContent = Object.entries(target.data())
//                 .filter(([k,])=>!/^_/.test(k))
//                 .map(([k,v])=>`${k}: ${v}`);
//             console.log(tooltip);

//             document.body.appendChild(tooltip);

//             return tooltip;
//         }
//     });

//     target.on('position', () => {
//         popper.scheduleUpdate();
//     });

//     target.cy().on('pan zoom resize', () => {
//         popper.scheduleUpdate();
//     });

//     target.on('mouseover', () => {
//         if (document.getElementById(tooltipId)) {
//             document.getElementById(tooltipId).classList.add('active');
//         }
//     }).on('mouseout', () => {
//         if (document.getElementById(tooltipId)) {
//             document.getElementById(tooltipId).classList.remove('active');
//         }
//     })
// };

const layoutOptions = {
    elk: {
        nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
        fit: true, // Whether to fit
        padding: 20, // Padding on fit
        animate: false, // Whether to transition the node positions
        animateFilter: function(){ return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
        animationDuration: 500, // Duration of animation in ms if enabled
        animationEasing: undefined, // Easing of animation if enabled
        transform: function( _, pos ){ return pos; }, // A function that applies a transform to the final node position
        ready: undefined, // Callback on layoutready
        stop: undefined, // Callback on layoutstop
        elk: {
            // All options are available at http://www.eclipse.org/elk/reference.html
            //
            // 'org.eclipse.' can be dropped from the identifier. The subsequent identifier has to be used as property key in quotes.
            // E.g. for 'org.eclipse.elk.direction' use:
            // 'elk.direction'
            //
            // Enums use the name of the enum as string e.g. instead of Direction.DOWN use:
            // 'elk.direction': 'DOWN'
            //
            // The main field to set is `algorithm`, which controls which particular layout algorithm is used.
            // Example (downwards layered layout):
            'algorithm': 'layered',
            'elk.direction': 'DOWN',
        },
        priority: function( ){ return null; }, // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled
    },
    cola: {
        name: 'cola',
        refresh: 3,
        convergenceThreshold: 0.05,
        nodeSpacing: function() { return 20 },
        edgeLength: function() { return 10 },
    },
    euler: {
        name: 'euler',

        // The ideal length of a spring
        // - This acts as a hint for the edge length
        // - The edge length can be longer or shorter if the forces are set to extreme values
        springLength: () => 80,

        // Hooke's law coefficient
        // - The value ranges on [0, 1]
        // - Lower values give looser springs
        // - Higher values give tighter springs
        springCoeff: () => 0.0008,

        // The mass of the node in the physics simulation
        // - The mass affects the gravity node repulsion/attraction
        mass: () => 4,

        // Coulomb's law coefficient
        // - Makes the nodes repel each other for negative values
        // - Makes the nodes attract each other for positive values
        gravity: -1.2,

        // A force that pulls nodes towards the origin (0, 0)
        // Higher values keep the components less spread out
        pull: 0.001,

        // Theta coefficient from Barnes-Hut simulation
        // - Value ranges on [0, 1]
        // - Performance is better with smaller values
        // - Very small values may not create enough force to give a good result
        theta: 0.666,

        // Friction / drag coefficient to make the system stabilise over time
        dragCoeff: 0.02,

        // When the total of the squared position deltas is less than this value, the simulation ends
        movementThreshold: 1,

        // The amount of time passed per tick
        // - Larger values result in faster runtimes but might spread things out too far
        // - Smaller values produce more accurate results
        timeStep: 20,

        // The number of ticks per frame for animate:true
        // - A larger value reduces rendering cost but can be jerky
        // - A smaller value increases rendering cost but is smoother
        refresh: 10,

        // Whether to animate the layout
        // - true : Animate while the layout is running
        // - false : Just show the end result
        // - 'end' : Animate directly to the end result
        animate: true,

        // Animation duration used for animate:'end'
        animationDuration: undefined,

        // Easing for animate:'end'
        animationEasing: undefined,

        // Maximum iterations and time (in ms) before the layout will bail out
        // - A large value may allow for a better result
        // - A small value may make the layout end prematurely
        // - The layout may stop before this if it has settled
        maxIterations: 1000,
        maxSimulationTime: 4000,

        // Prevent the user grabbing nodes during the layout (usually with animate:true)
        ungrabifyWhileSimulating: false,

        // Whether to fit the viewport to the repositioned graph
        // true : Fits at end of layout for animate:false or animate:'end'; fits on each frame for animate:true
        fit: true,

        // Padding in rendered co-ordinates around the layout
        padding: 30,

        // Constrain layout bounds with one of
        // - { x1, y1, x2, y2 }
        // - { x1, y1, w, h }
        // - undefined / null : Unconstrained
        boundingBox: undefined,

        // Layout event callbacks; equivalent to `layout.one('layoutready', callback)` for example
        ready: function(){}, // on layoutready
        stop: function(){}, // on layoutstop

        // Whether to randomize the initial positions of the nodes
        // true : Use random positions within the bounding box
        // false : Use the current node positions as the initial positions
        randomize: false
        }
}

export default {
    name: 'v-graph',
    props: {
        nodes: Array,
        links: Array,
    },
    methods: {
        layouts() {
            this.graph.layout(layoutOptions.cola).run();
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