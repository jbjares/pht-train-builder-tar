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
        'content': 'data(stationName)',
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


// Click handler for fetching the models from the registry
cy.on('click', 'node', function(evt){

     document.location.href = this.data("model_route");
});
