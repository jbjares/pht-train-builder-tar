// Initialize station table
var stationTable = $("#station-table").DataTable(
  {
    "bPaginate": false,
    "bLengthChange": false,
    "bFilter": false,
    "bInfo": false,
    "bAutoWidth": false,
  "ajax": {
      "url": "http://localhost:6006/station",
      "dataSrc": ""
  },
  "columns": [
      { "data": "stationName" },
      { "data": "stationURI" },
      { "data": "stationID" }
  ]
  }
);

// Click handler for adding new stations
$('#station-table tbody').on('click', 'tr', function () {

        var data = stationTable.row( this ).data();
        alert( 'You clicked on '+data[0]+'\'s row' );
} );
