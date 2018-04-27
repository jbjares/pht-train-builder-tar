// ---------------------------------------------------------------
// Initialize Cytoscape Canvas for the RouteViewer
// ---------------------------------------------------------------
const cy = window.cy = cytoscape({

  container: document.getElementById('cy'),

  boxSelectionEnabled: false,
  autounselectify: false,

  layout: {
    name: 'dagre'
  },

  style: [
    {
      selector: 'node',
      style: {
        'content': 'data(label)',
        'text-opacity': 0.5,
        'text-valign': 'center',
        'text-halign': 'right',
        'background-color': '#11479e'
      }
    }, {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'width': 4,
        'target-arrow-shape': 'triangle',
        'line-color': '#9dbaea',
        'target-arrow-color': '#9dbaea'
      }
    }
  ]
});
