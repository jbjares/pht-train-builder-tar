
// ---------------------------------------------------------------
// Initialize Cytoscape Canvas for the RoutePlanner
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

// constant settings for the contextmenu
const cxtmenu_common = {

    menuRadius: 100,
    fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
    activeFillColor: 'rgba(1, 105, 217, 0.75)', // the colour used to indicate the selected command
    activePadding: 20, // additional size in pixels for the active command
    indicatorSize: 24, // the size in pixels of the pointer to the active command
    separatorWidth: 3, // the empty spacing in pixels between successive commands
    spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
    minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
    maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
    openMenuEvents: 'cxttapstart taphold', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
    itemColor: 'white', // the colour of text in the command's content
    itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
    zIndex: 9999, // the z-index of the ui div
    atMouse: false, // draw menu at mouse position
    commands: [ // an array of commands to list in the menu or a function that returns the array
     { // example command
       fillColor: 'rgba(200, 0, 0, 0.75)', // optional: custom background color for item
       content: 'Delete', // html/text content to be displayed in the menu
       contentStyle: {}, // css key:value pairs to set the command's css in js if you want
       select: cy.remove,
       enabled: true // whether the command is selectable
     }, {
       fillColor: 'rgba(0, 50, 50, 0.75)', // optional: custom background color for item
       content: 'Info', // html/text content to be displayed in the menu
       contentStyle: {}, // css key:value pairs to set the command's css in js if you want
       select: function(ele) {

          alert("Dummy Information")
       },
       enabled: true // whether the command is selectable
   }
   ]
};

const nodeMenu = cy.cxtmenu(

   Object.assign({}, cxtmenu_common, {

       selector: 'node'
   })
);

const edgeMenu = cy.cxtmenu(

   Object.assign({}, cxtmenu_common, {

       selector: 'edge'
   })
);


const eh = cy.edgehandles({
  preview: true, // whether to show added edges preview before releasing selection
  hoverDelay: 150, // time spent hovering over a target node before it is considered selected
  handleNodes: 'node', // selector/filter function for whether edges can be made from a given node
  handlePosition: function( node ){
    return 'right right'; // sets the position of the handle in the format of "X-AXIS Y-AXIS" such as "left top", "middle top"
  },
  handleInDrawMode: false, // whether to show the handle in draw mode
  edgeType: function( sourceNode, targetNode ){
    // can return 'flat' for flat edges between nodes or 'node' for intermediate node between them
    // returning null/undefined means an edge can't be added between the two nodes
    return 'flat';
  },
  loopAllowed: function( node ){
    // for the specified node, return whether edges from itself to itself are allowed
    return false;
  },
  nodeLoopOffset: -50 // offset for edgeType: 'node' loops
});
