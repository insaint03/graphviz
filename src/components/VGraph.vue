<template>
    <div ref="vgraph" id="vgraph" />
</template>
<script>
import {Graph} from 'vivagraphjs';

export default {
    name: 'v-graph',
    props: {
        nodes: Array,
        links: Array,
    },
    methods: {
        show() {
            this.renderer.run();
        }
    },
    mounted() {

        this.show();
    },
    computed: {
        canvas() {
            return this.$refs.vgraph;
        },
        graph() {
            let g = Graph.graph();
            this.nodes.forEach((n)=> {
                g.addNode.apply(...n); 
            });
            this.links.forEach((ln)=> {
                g.addLink(...ln);
            });
            return g;
        },
        hasWebGLSupport() {
          try {
            let canvas = document.createElement('canvas');
            return true && canvas.getContext('webgl');
          } catch {
            return false;
          }
        },
        layout() {
            return Graph.Layout.forceDirected(this.graph, {
                springLength : 50,
                springCoeff : 1e-4,
                dragCoeff : 0.005,
                gravity : -1.5,
                theta : 0.75,
            });
        },
        graphics() {
            return this.hasWebGLSupport 
                ? Graph.View.webglGraphics() 
                : Graph.View.svgGraphics();
        },
        renderer() {
            return Graph.View.renderer(this.graph, {
                layout: this.layout,
                graphics: this.graphics,
                renderLinks: true,
                container: this.canvas,
            });
        }
    },
    data() {
        return {
            // graph: Graph.graph(),
        }
    }
}
</script>

<style scoped>
div#vgraph {
    min-height: 800px;
    min-width: 600px;
}
div#vgraph > canvas {
    width: 100%;
    height: 100%;
}
</style>