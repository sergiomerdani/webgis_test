import "./style.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import Tile from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { Projection, transformExtent } from "ol/proj";
import TileWMS from "ol/source/tileWMS.js";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import Group from "ol/layer/Group";
import LayerGroup from "ol/layer/Group";
import { Draw, DragBox, Select, Modify } from "ol/interaction";
import { Point, LineString, Polygon } from "ol/geom";
import {
  click,
  shiftKeyOnly,
  platformModifierKeyOnly,
} from "ol/events/condition";
import { GeoJSON, WFS, WKT } from "ol/format";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import PrintDialog from "ol-ext/control/PrintDialog";
import Overlay from "ol/Overlay.js";

import CanvasAttribution from "ol-ext/control/CanvasAttribution";
import CanvasScaleLine from "ol-ext/control/CanvasScaleLine";
import CanvasTitle from "ol-ext/control/CanvasTitle";
import { Style, Text, Icon, Stroke, Fill, Image } from "ol/style";

import Legend from "ol-ext/legend/Legend";
import Layer from "ol/layer/Layer";
import { WMTSCapabilities } from "ol/format";
import { optionsFromCapabilities } from "ol/source/WMTS";
import WMTS from "ol/source/WMTS";
import { toStringHDMS } from "ol/coordinate.js";
import { fromLonLat, toLonLat } from "ol/proj.js";

proj4.defs(
  "EPSG:6870",
  "+proj=tmerc +lat_0=0 +lon_0=20 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);

const projection6870 = new Projection({
  code: "EPSG:6870",
  extent: [-2963585.56, 3639475.76, 2404277.44, 9525908.77],
  worldExtent: [-90, -90, 90, 90],
});

const krgjshCenter = [487634.64309, 4577027.351259];

let asigMaps;

const osm = new TileLayer({
  source: new OSM({
    crossOrigin: "anonymous",
  }),
  title: "OSM",
});

const extent6870 = [
  394523.8243760248, 4378288.751098856, 601384.7112518024, 4736589.374424876,
];
const extent3857_v1 = [
  2206278.3844229993, 5060803.903397999, 2364259.4194297767, 5275222.025859494,
];
const extent4326 = [18.773065, 39.538499, 21.179343, 42.758209];
const extent3857 = transformExtent(extent6870, projection6870, "EPSG:4326");

// const orthoFarke = new TileLayer({
//   source: new TileWMS({
//     url: "http://localhost:8080/geoserver/my_workspace1/wms",
//     params: {
//       LAYERS: "my_workspace1:ortho_farke_KRGJSH",
//       VERSION: "1.1.0",
//     },
//   }),
//   visible: false,
//   title: "orthoFarke WMS",
//   information: "Kufiri i tokësor i republikës së Shqipërisë",
//   displayInLayerSwitcher: true,
// });

const shkshInstitucionet = new TileLayer({
  source: new TileWMS({
    url: "http://localhost:8080/geoserver/test/wms?service=WMS",
    params: {
      LAYERS: "test:points",
      VERSION: "1.1.0",
    },
    // crossOrigin: "anonymous",
  }),
  visible: false,
  title: "Shksh Institucionet",
  information: "Kufiri i tokësor i republikës së Shqipërisë",
  displayInLayerSwitcher: true,
});

const wfsVectorSourcePoints = new VectorSource({
  url: "http://localhost:8080/geoserver/test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test:points&maxFeatures=50&outputFormat=application/json",
  format: new GeoJSON(),
  attributions: "@geoserver",
});

//ADD WFS
const wfsVectorLayerPoints = new VectorLayer({
  source: wfsVectorSourcePoints,
  title: "Points Vector Layer",
  // crossOrigin: "anonymous",
  // opacity: 0,
  visible: true,
});

const wfsVectorSourcePolygon = new VectorSource({
  url: "http://localhost:8080/geoserver/test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test:polygon&maxFeatures=50&outputFormat=application/json",
  format: new GeoJSON(),
  attributions: "@geoserver",
});

//ADD WFS
const wfsVectorLayerPolygon = new VectorLayer({
  source: wfsVectorSourcePolygon,
  title: "Polygon Vector Layer",
  // crossOrigin: "anonymous",
  // opacity: 0,
  visible: true,
});

const shkshSherbimet = new TileLayer({
  source: new TileWMS({
    url: "http://localhost:8080/geoserver/test/wms?service=WMS",
    params: {
      LAYERS: "test:line",
      VERSION: "1.0.0",
    },
    // crossOrigin: "anonymous",
  }),
  visible: false,
  title: "Shksh Sherbimet",
  information: "Kufiri i tokësor i republikës së Shqipërisë",
  displayInLayerSwitcher: true,
});

asigMaps = new Group({
  layers: [shkshInstitucionet, shkshSherbimet],
  displayInLayerSwitcher: true,
  title: "Asig Raster",
});

const map = new Map({
  target: "map",
  layers: [osm],
  view: new View({
    projection: projection6870,
    center: krgjshCenter,
    zoom: 5,
  }),
});

// map.addLayer(shkshInstitucionet);
// map.addLayer(shkshSherbimet);
map.addLayer(wfsVectorLayerPoints);
map.addLayer(wfsVectorLayerPolygon);

//WMTS Ortho 2015
var wmts_parser = new WMTSCapabilities();
fetch("https://geoportal.asig.gov.al/service/wmts?request=getCapabilities")
  .then(function (response) {
    return response.text();
  })
  .then(function (text) {
    var result = wmts_parser.read(text);
    var opt_ortho_2015_20 = optionsFromCapabilities(result, {
      layer: "orthophoto_2015:OrthoImagery_20cm",
      matrixSet: "EPSG:6870",
    });

    const orthoASIG = new Tile({
      name: "Ortofoto 2015 20cm WMTS",
      shortName: "2015 20cm",
      visible: false,
      source: new WMTS(opt_ortho_2015_20),
    });
    map.addLayer(orthoASIG);
  })
  .catch(function (error) {});

const layerList = [shkshInstitucionet, shkshSherbimet];

let fields = [];

//PRINT CONTROL AND LEGEND

map.addControl(new CanvasAttribution({ canvas: true }));
// // Add a title control
map.addControl(
  new CanvasTitle({
    title: "Map Title",
    visible: false,
    style: new Style({
      text: new Text({
        font: '20px "Lucida Grande",Verdana,Geneva,Lucida,Arial,Helvetica,sans-serif',
      }),
    }),
  })
);

// Add a ScaleLine control
const canvasScaleLine = new CanvasScaleLine();
map.addControl(canvasScaleLine);
const printControl = new PrintDialog({});
map.addControl(printControl);

// Legend
var legend = new Legend({
  title: "Legjenda",
  margin: 10,
  items: [],
});
let newItem, layerTitle, layer, clickedLayer;

const getLegendItems = legend.getItems().getArray();

const addNewItemToLegend = (layer) => {
  if (layer instanceof LayerGroup) {
    return;
  }
  newItem = {
    title: layer.get("title"),
    typeGeom: "Point",
    style: new Style({
      image: new Icon({
        src: layer.getSource().getLegendUrl(),
        crossOrigin: "anonymous",
      }),
    }),
  };
  legend.addItem(newItem);
};

// Customizing layer switcher functions
const layerGroups = [asigMaps];

const onChangeCheck = function (evt) {
  layer = evt;
  layerTitle = layer.get("title");
  const layerVisibility = layer.getVisible();

  clickedLayer = evt;

  const parentLayerGroup = findParentLayerGroup(clickedLayer);
  //Turn on the LayerGroup when a subLayer is visible
  if (parentLayerGroup && clickedLayer.getVisible()) {
    parentLayerGroup.setVisible(true);
    //Check if one of the subLayers it visible
  } else if (parentLayerGroup && hasVisibleSubLayer(parentLayerGroup)) {
    parentLayerGroup.setVisible(false);
  }

  const baseLayer = clickedLayer.get("title") === "Base Layers";
  try {
    const layers = evt.getLayers().getArray();
    //Turn on/off all the sublayers of the LayerGroup
    layers.forEach((subLayer) => {
      if (
        clickedLayer instanceof LayerGroup &&
        clickedLayer.values_.visible === true &&
        !baseLayer
      ) {
        subLayer.setVisible(true);
      } else {
        subLayer.setVisible(false);
      }
    });
  } catch (error) {}
};

function findParentLayerGroup(layer) {
  let parentLayerGroup = null;

  map.getLayers().forEach((group) => {
    if (group instanceof LayerGroup) {
      const layersInGroup = group.getLayers().getArray();
      if (layersInGroup.includes(layer)) {
        parentLayerGroup = group;
        return;
      }
    }
  });
  return parentLayerGroup;
}

// Function to check if at least one sub-layer within a layer group is visible
const hasVisibleSubLayer = function (layerGroup) {
  if (!(layerGroup instanceof LayerGroup)) {
    return false;
  }
  const layers = layerGroup.getLayers().getArray();
  let isAnySubLayerVisible = false;
  layers.forEach((subLayer) => {
    if (subLayer.getVisible()) {
      isAnySubLayerVisible = true;
    }
  });
  layerGroup.setVisible(isAnySubLayerVisible);
};
// Loop through each layer group and update its visibility
layerGroups.forEach((layerGroup) => {
  hasVisibleSubLayer(layerGroup);
});

//____________________________________________________________________

const layerSwitcher = new LayerSwitcher({
  collapsed: false,
  onchangeCheck: onChangeCheck,
  selection: true,
});
map.addControl(layerSwitcher);

let layerParam,
  layerType,
  vectorLayer,
  featureName,
  wfsVectorSource,
  formattedCoordinates,
  workspace = "test";

layerSwitcher.on("select", (e) => {
  const layer = e.layer;
  const layerName = layer.get("title");
  const features = layer.getSource().getFeatures();
  // features.forEach((feature) => {
  //   console.log(feature.getGeometry().getCoordinates());
  // });
  if (layerName === "Line Vector Layer") {
    layerParam = "test:line";
    layerType = "LineString";
    featureName = "line";
    vectorLayer = wfsVectorLayerLine;
    wfsVectorSource = wfsVectorSourceLine;
    console.log(layerType);
  } else if (layerName === "Points Vector Layer") {
    layerParam = "test:points";
    layerType = "Point";
    featureName = "points";
    vectorLayer = wfsVectorLayerPoints;
    wfsVectorSource = wfsVectorSourcePoints;
    console.log(layerParam);
  } else if (layerName === "Polygon Vector Layer") {
    layerParam = "test:polygon";
    layerType = "Polygon";
    featureName = "polygon";
    vectorLayer = wfsVectorLayerPolygon;
    wfsVectorSource = wfsVectorSourcePolygon;
    console.log(layerParam);
  }
});

//DRAW INTERACTION
// Create a vector source and layer for the drawn features
// const vectorSource = new VectorSource();
// const vectorLayer = new VectorLayer({
//   source: vectorSource,
//   displayInLayerSwitcher: false,
// });
// map.addLayer(vectorLayer);

const drawFeature = document.getElementById("drawPolygon");
const selectFeature = document.getElementById("selectFeature");
const selectByPolygon = document.getElementById("selectByPolygon");
const modifyfeature = document.getElementById("modifyFeature");
const deletefeature = document.getElementById("deleteFeature");
let select, draw, listener, sketch, modify;

// drawFeature.addEventListener("click", (e) => {
//   // Drawing interaction
//   draw = new Draw({
//     source: vectorSource,
//     type: "Point",
//     //only draw when Ctrl is pressed.
//     // condition: platformModifierKeyOnly,
//   });
//   map.addInteraction(draw);
// });

//MODIFY INTERACTION
modifyfeature.addEventListener("click", (e) => {
  map.removeInteraction(draw);
  const modify = new Modify({ source: wfsVectorLayerLine.getSource() });
  map.addInteraction(modify);

  // Define a function to handle the geometry modification event
  modify.on("modifyend", function (event) {
    // Get the modified feature
    const modifiedFeature = event.features.item(0);

    // Get the modified geometry
    const modifiedGeometry = modifiedFeature.getGeometry().getCoordinates();

    const formattedCoordinates = modifiedGeometry
      .map((pairArray) => pairArray.map((pair) => pair.join(",")).join(" "))
      .join(" ");

    console.log(formattedCoordinates);

    // Send a WFS Transaction request to update the geometry
    const url = "http://localhost:8080/geoserver/test/ows";
    const xmlPayload = `<wfs:Transaction service="WFS" version="1.0.0"
                      xmlns:topp="http://www.openplans.org/topp"
                      xmlns:ogc="http://www.opengis.net/ogc"
                      xmlns:wfs="http://www.opengis.net/wfs"
                      xmlns:gml="http://www.opengis.net/gml"
                      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                      xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-transaction.xsd">
                      <wfs:Update typeName="test:line">
                        <wfs:Property>
                          <wfs:Name>geom</wfs:Name>
                          <wfs:Value>
                            <gml:MultiLineString srsName="http://www.opengis.net/gml/srs/epsg.xml#32634">
                              <gml:lineStringMember>
                                <gml:LineString>
                                  <gml:coordinates>${formattedCoordinates}</gml:coordinates>
                                </gml:LineString>
                              </gml:lineStringMember>
                            </gml:MultiLineString>
                          </wfs:Value>
                        </wfs:Property>
                        <ogc:Filter>
                          <ogc:FeatureId fid="${modifiedFeature.id_}"/>
                        </ogc:Filter>
                      </wfs:Update>
                    </wfs:Transaction>`;

    // Send the WFS Transaction request
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
      },
      body: xmlPayload,
    })
      .then((response) => response.text())
      .then((data) => {
        console.log("Geometry updated successfully:", data);
      })
      .catch((error) => {
        console.error("Error updating geometry:", error);
      });
  });
});

//SELECT FEATURE
const selected = new Style({
  fill: new Fill({
    color: "#eeeeee",
  }),
  stroke: new Stroke({
    color: "rgba(255, 255, 255, 0.7)",
    width: 2,
  }),
});

function selectStyle(feature) {
  const color = feature.get("COLOR") || "#eeeeee";
  selected.getFill().setColor(color);
  return selected;
}

let selectSingleClick,
  selectedFeatureValueID,
  featureID,
  url,
  nextID = 10;

selectFeature.addEventListener("click", (e) => {
  map.removeInteraction(draw);
  map.removeInteraction(modify);
  selectSingleClick = new Select({ style: selectStyle, hitTolerance: 5 });
  map.addInteraction(selectSingleClick);

  selectSingleClick.on("select", function (e) {
    const selectedFeatures = selectSingleClick.getFeatures().getArray();
    // console.log(selectedFeatures);
    e.selected.forEach(function (feature) {
      const selectedFeatureValueID = feature.id_;
      console.log(feature);
      // Get the geometry of the feature
      const geometry = feature.getGeometry();
      // Check the type of geometry
      if (geometry instanceof Point) {
        // For Point geometry
        const coordinates = geometry.getCoordinates();
      } else if (geometry instanceof LineString) {
        // For LineString geometry
        const coordinates = geometry.getCoordinates();
      } else if (geometry instanceof Polygon) {
        // For Polygon geometry
        const coordinates = geometry.getCoordinates();
      }
      // You can handle other geometry types similarly
    });
  });
});

const wfsVectorSourceLine = new VectorSource({
  url: "http://localhost:8080/geoserver/test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test:line&maxFeatures=50&outputFormat=application/json",
  format: new GeoJSON(),
  attributions: "@geoserver",
});

//ADD WFS
const wfsVectorLayerLine = new VectorLayer({
  source: wfsVectorSourceLine,
  title: "Line Vector Layer",
  // crossOrigin: "anonymous",
  // opacity: 0,
  visible: true,
});
map.addLayer(wfsVectorLayerLine);

const drawFeatureWfs = document.getElementById("drawWfs");
// Draw Feature Event Listener
drawFeatureWfs.addEventListener("click", (e) => {
  draw = new Draw({
    source: vectorLayer.getSource(),
    type: layerType,
  });

  map.addInteraction(draw);

  draw.on("drawend", function (event) {
    const feature = event.feature;
    const featureID = feature.getId();
    // Set the ID attribute to the feature
    const coordinates = feature.getGeometry().getCoordinates();
    console.log(coordinates);

    if (layerType === "LineString") {
      // Map over the array and join each pair of coordinates with a space
      formattedCoordinates = coordinates
        .map((pair) => pair.join(","))
        .join(" ");

      console.log("Line Coordinates:", formattedCoordinates);
    } else if (layerType === "Polygon") {
      const formattedData = coordinates.map((set) =>
        set
          .map((coord) => coord.join(","))
          .slice(0, -1)
          .join(" ")
      );

      // Join the formatted data by newline
      formattedCoordinates = formattedData.join("\n");

      console.log("Polygon Coordinates:", formattedCoordinates);
    } else if (layerType === "Point") {
      const switchedCoordinates = [coordinates[1], coordinates[0]];

      formattedCoordinates = switchedCoordinates.join(" ");
    }

    url = "http://localhost:8080/geoserver/test/ows";

    const body = `<wfs:Transaction service="WFS" version="1.0.0"
    xmlns:wfs="http://www.opengis.net/wfs"
    xmlns:test="http://www.openplans.org/test"
    xmlns:gml="http://www.opengis.net/gml"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-transaction.xsd http://www.openplans.org http://localhost:8080/geoserver/wfs/DescribeFeatureType?typename=test:line">
    <wfs:Insert>
      <${featureName}>
        <${workspace}:geom>
          <gml:MultiLineString srsName="http://www.opengis.net/gml/srs/epsg.xml#32634">
            <gml:lineStringMember>
              <gml:LineString>
                <gml:coordinates decimal="." cs="," ts=" ">
                ${formattedCoordinates}
                </gml:coordinates>
              </gml:LineString>
            </gml:lineStringMember>
          </gml:MultiLineString>
        </${workspace}:geom>
        <${workspace}:TYPE>alley</${workspace}:TYPE>
      </${featureName}>
    </wfs:Insert>
    </wfs:Transaction>`;

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
      },
      body: body,
    };

    // Make the POST request using the Fetch API
    fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // Parse the JSON response
        return response.text();
      })
      .then((data) => {
        wfsVectorSource.refresh();

        // Handle the data returned by the server
        console.log("Response from server:", data);
      })
      .catch((error) => {
        // Handle errors that occur during the fetch request
        console.error("There was a problem with your fetch operation:", error);
      });
  });
});

// DELETE WFS Event Listener
const deleteWFS = document.getElementById("deleteWfs");
deleteWFS.addEventListener("click", (e) => {
  const selectedFeatures = selectSingleClick.getFeatures();
  const selectedFeaturesArray = selectedFeatures.getArray();
  console.log(selectedFeaturesArray);
  selectedFeaturesArray.forEach((feature) => {
    // Do something with the feature
    wfsVectorLayerLine.getSource().removeFeature(feature);
    const selectedFeatureValueID = feature.get("id");
    // You can perform any other operations with the feature here
    url = "http://localhost:8080/geoserver/test/ows";
    const body = `<wfs:Transaction service="WFS" version="1.0.0"
                  xmlns:cdf="http://www.opengis.net/cite/data"
                  xmlns:ogc="http://www.opengis.net/ogc"
                  xmlns:wfs="http://www.opengis.net/wfs"
                  xmlns:topp="http://www.openplans.org/topp">
                  <wfs:Delete typeName="test:line">
                    <ogc:Filter>
                      <ogc:PropertyIsEqualTo>
                        <ogc:PropertyName>id</ogc:PropertyName>
                        <ogc:Literal>${selectedFeatureValueID}</ogc:Literal>
                      </ogc:PropertyIsEqualTo>
                    </ogc:Filter>
                  </wfs:Delete>
                </wfs:Transaction>`;

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
      },
      body: body,
    };

    // Make the POST request using the Fetch API
    fetch(url, options)
      .then((response) => {
        console.log(response);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // Parse the JSON response
        return response.text();
      })
      .then((data) => {
        // Handle the data returned by the server
        console.log("Response from server:", data);
      })
      .catch((error) => {
        // Handle errors that occur during the fetch request
        console.error("There was a problem with your fetch operation:", error);
      });
  });
});

// Create a new overlay
const popup = new Overlay({
  element: document.getElementById("popup"),
  positioning: "bottom-center",
});
map.addOverlay(popup);

//GET INFO
const getInfoButton = document.getElementById("getInfo");

getInfoButton.addEventListener("click", (e) => {
  map.removeInteraction(draw);
  getFeatureInfo();
});

// Function to handle getting feature info
function getFeatureInfo() {
  // Listen for single clicks on the map
  map.on("singleclick", function (event) {
    const coordinate = event.coordinate;
    // Get the clicked pixel
    const pixel = event.pixel;
    // Check if a feature is present at the clicked pixel
    map.forEachFeatureAtPixel(pixel, function (feature) {
      featureID = feature.getId();
      // Access properties of the clicked feature
      var properties = feature.getProperties();
      updatePopupContent(properties);
      // Set popup position to the clicked coordinate
      popup.setPosition(coordinate);
    });
  });
}

// Function to update the content of the popup with feature properties
function updatePopupContent(properties) {
  // Get references to the input fields
  const idInput = document.getElementById("id-input");
  const nameInput = document.getElementById("name-input");
  const statusInput = document.getElementById("status-input");

  // Set the value of the input fields
  idInput.value = properties.id;
  nameInput.value = properties.name;
  statusInput.value = properties.status;
}

//TRANSACTION TO SAVE DATA USING WFS
// Function to save the changes to the database using WFS transaction
function saveChanges(properties) {
  // Prepare the transaction request XML
  var transactionXML = `
  <wfs:Transaction service="WFS" version="1.0.0"
  xmlns:topp="http://www.openplans.org/topp"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:wfs="http://www.opengis.net/wfs">
  <wfs:Update typeName="test:line">
  <wfs:Property>
  <wfs:Name>id</wfs:Name>
  <wfs:Value>${properties.id}</wfs:Value>
  </wfs:Property>
    <wfs:Property>
      <wfs:Name>name</wfs:Name>
      <wfs:Value>${properties.name}</wfs:Value>
    </wfs:Property>
    <wfs:Property>
    <wfs:Name>status</wfs:Name>
    <wfs:Value>${properties.status}</wfs:Value>
  </wfs:Property>
    <ogc:Filter>
      <ogc:FeatureId fid="${featureID}"/>
    </ogc:Filter>
  </wfs:Update>
</wfs:Transaction>
  `;

  // Send the transaction request to the WFS server
  fetch("http://localhost:8080/geoserver/test/ows", {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
    },
    body: transactionXML,
  })
    .then((response) => response.text())
    .then((data) => {
      // Handle the response from the server
      console.log("Transaction Response:", data);
      // You can show a success message or handle errors here
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Event listener for the save button
const saveButton = document.getElementById("saveButton");
saveButton.addEventListener("click", (e) => {
  // Get the updated properties from the input fields
  const updatedId = document.getElementById("id-input").value;
  const updatedName = document.getElementById("name-input").value;
  const updateStatus = document.getElementById("status-input").value;

  // Create an object with the updated properties
  const updatedProperties = {
    id: updatedId,
    name: updatedName,
    status: updateStatus,
    // Add more properties as needed
  };

  // Call the saveChanges function to save the changes to the database
  saveChanges(updatedProperties);
});

//UPDATE FEATURE ID
const addIDButton = document.getElementById("addID");

addIDButton.addEventListener("click", function (e) {
  const selectedFeatures = selectSingleClick.getFeatures();
  const selectedFeaturesArray = selectedFeatures.getArray();
  selectedFeaturesArray.forEach((feature) => {
    const properties = feature.getProperties();
    console.log(properties.id);
    console.log(feature.id_);
    updatePropertyID(feature.id_);
  });
});
function updatePropertyID(featureID) {
  url = "http://localhost:8080/geoserver/test/ows";

  var updateBody = `
  <wfs:Transaction service="WFS" version="1.0.0"
  xmlns:topp="http://www.openplans.org/topp"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:wfs="http://www.opengis.net/wfs">
  <wfs:Update typeName="${layerParam}">
  <wfs:Property>
  <wfs:Name>id</wfs:Name>
  <wfs:Value>${featureID}</wfs:Value>
  </wfs:Property>
    <ogc:Filter>
      <ogc:FeatureId fid="${featureID}"/>
    </ogc:Filter>
  </wfs:Update>
</wfs:Transaction>
  `;

  const updateOptions = {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
    },
    body: updateBody,
  };

  fetch(url, updateOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      console.log("Property ID updated successfully:", data);
    })
    .catch((error) => {
      console.error("Error updating property ID:", error);
    });
}

//SAVE TO LAYER
const saveToLayerButton = document.getElementById("saveToLayer");

saveToLayerButton.addEventListener("click", (e) => {
  // Get all features from the vector source
  const features = wfsVectorSource.getFeatures();
  const lastFeature = features[features.length - 1];
  // Access feature properties
  const lastFeatureId = lastFeature.getId();

  // Log the properties of the last feature
  console.log("Last feature:", lastFeature.getId());
  console.log(features);
  updatePropertyID(lastFeatureId);
  wfsVectorSource.refresh();
});
