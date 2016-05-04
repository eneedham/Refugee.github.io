
var map = L.map('map', {
center: [40.000, -75.1090],
zoom: 11,
zoomControl:false
});


var Stamen_TonerLite = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
subdomains: 'abcd',
minZoom: 0,
maxZoom: 20,
ext: 'png'
}).addTo(map);

//*****************************************************
//Global Variables
sql = new cartodb.SQL({user: 'eneedham', format: 'geojson'});
sql2 = new cartodb.SQL({user: 'eneedham'});
var cartoDBUserName = "eneedham";
var sum = "(";
var bins;
var myList = [];
var myData;
var popUpcontent = "Feature Score: ";
var dens;
var theLayer;

$(".legend").hide();
$("#redo").hide();

//Default Zoom
var defaultViewFunc = function(){
    map.setView([40.000, -75.1090], 11);
};

//Default Zoom button
$("#reset-zoom").click(function(){
  defaultViewFunc();
});

//Function to zoom in & add popUp
var eachFeature = function(feature, layer) {
  layer.on('click', function (e) {
    var bounds = this.getBounds();
    map.fitBounds(bounds);
  });
};

$('#demolist li a').on('click', function(){
  $('#all').prop('checked', false);
  $('#elem').prop('checked', false);
  $('#middle').prop('checked', false);
  $('#high').prop('checked', false);
  $('#food').prop('checked', false);
  $('#trans').prop('checked', false);
  $('#lib').prop('checked', false);
  $('#com').prop('checked', false);
  $('#health').prop('checked', false);
  sum = "(";
  dens = undefined;
  dens = $(this).text();
  dens2 = dens.toLowerCase();
  sum = sum+dens2;
});

var myStyle = function (feature){
  if(feature.properties.total <= myList[0]){
    return {fillColor: "#053061", fillOpacity: 0.5, color: "#434343", weight: 1};
  }
  if(feature.properties.total > myList[0] && feature.properties.total <= myList[1]){
    return {fillColor: "#2166ac", fillOpacity: 0.5, color: "#434343", weight: 1};
  }
  if(feature.properties.total > myList[1] && feature.properties.total <= myList[2]){
    return {fillColor: "#4393c3", fillOpacity: 0.5, color: "#434343", weight: 1};
  }
  if(feature.properties.total > myList[2] && feature.properties.total <= myList[3]){
    return {fillColor: "#92c5de", fillOpacity: 0.5, color: "#434343", weight: 1};
  }
  if(feature.properties.total > myList[3] && feature.properties.total <= myList[4]){
    return {fillColor: "#d1e5f0", fillOpacity: 0.5, color: "#434343", weight: 1};
  }
  if(feature.properties.total > myList[4] && feature.properties.total <= myList[5]){
    return {fillColor: "#f7f7f7", fillOpacity: 0.5, color: "#434343", weight: 1};
  }
  if(feature.properties.total > myList[5] && feature.properties.total <= myList[6]){
    return {fillColor: "#fddbc7", fillOpacity: 0.5, color: "#434343", weight: 1};
  }
  if(feature.properties.total > myList[6] && feature.properties.total <= myList[7]){
    return {fillColor: "#f4a582", fillOpacity: 0.5, color: "#434343", weight: 1};
  }
  if(feature.properties.total > myList[7] && feature.properties.total <= myList[8]){
    return {fillColor: "#d6604d", fillOpacity: 0.5, color: "#434343", weight: 1};
  }
  if(feature.properties.total > myList[8] && feature.properties.total <= myList[9]){
    return {fillColor: "#b2182b", fillOpacity: 0.5, color: "#434343", weight: 1};
  }
  if(feature.properties.total > myList[9]){
    return {fillColor: "#67001f", fillOpacity: 0.5, color: "#434343", weight: 1};
  }
  else{
    return {fillColor: "#B3ADA4", fillOpacity: 0.5, color: "#434343", weight: 1};
  }
};

  $('#all').change(function() {
    if($('#all').is(":checked")){
      $('#elem').prop('checked', true);
      $('#middle').prop('checked', true);
      $('#high').prop('checked', true);
      $('#food').prop('checked', true);
      $('#trans').prop('checked', true);
      $('#lib').prop('checked', true);
      $('#com').prop('checked', true);
      $('#health').prop('checked', true);
    }
    if(!$('#all').is(":checked")){
      $('#elem').prop('checked', false);
      $('#middle').prop('checked', false);
      $('#high').prop('checked', false);
      $('#food').prop('checked', false);
      $('#trans').prop('checked', false);
      $('#lib').prop('checked', false);
      $('#com').prop('checked', false);
      $('#health').prop('checked', false);
    }
  });

  $("#submit").click(function() {
    $(".legend").show();
    $("#redo").show();
    $(".factors-title").hide();
    $(".checkbox").hide();
    $(".btn-group").hide();
    $("#submit").hide();


    $('#submit').prop('disabled', true);
    $('#redo').prop('disabled', false);
    $('.checkbox').prop('disabled', true);
    if ($('#elem').is(":checked")) {
      sum = sum+"+elementary";
    }
    if ($('#middle').is(":checked")) {
      sum = sum+"+middle";
      // console.log('hi');
    }
    if ($('#high').is(":checked")) {
      sum = sum+"+high";
      // console.log('hi');
    }
    if ($('#food').is(":checked")) {
      sum = sum+"+food";
    }
    if ($('#trans').is(":checked")) {
      sum = sum+"+transit_qm+transit_hm";
    }
    if ($('#lib').is(":checked")) {
      sum = sum+"+library";
    }
    if ($('#com').is(":checked")) {
      sum = sum+"+commercial";
    }
    if ($('#health').is(":checked")) {
      sum = sum+"+health";
    }
    if (sum === "("){
      alert("Please pick at least one parameter");
    }
    sql2.execute( "SELECT unnest(CDB_QuantileBins(array_agg"+sum+")::numeric[],10)) as total2 from blockgroups_final_res").done(function(result) {
    bins = result;
    for (i = 0; i < bins.rows.length; i++){
        myList.push(bins.rows[i].total2);}
      });

    sql.execute("SELECT geoid10, the_geom, commercial, elementary, food, health, library, transit_qm, transit_hm,"+sum+") as total FROM blockgroups_final_res").done(function(geojson) {
      myData = geojson;
      theLayer = L.geoJson(geojson, {
        onEachFeature: eachFeature,
        style: myStyle,
      }).addTo(map).addData(myData);
    });

    });

  $("#redo").click(function(){
    sum = "(";
    myList =[];
    if (map.hasLayer(theLayer)){
        map.removeLayer(theLayer);
    }

    $(".legend").hide();
    $("#redo").hide();
    $(".factors-title").show();
    $(".checkbox").show();
    $(".btn-group").show();
    $("#submit").show();


    $('#submit').prop('disabled', false);
    $('.checkbox').prop('disabled', false);
    $('.checkbox').prop('checked', false);
    $('#redo').prop('disabled', true);
  });
