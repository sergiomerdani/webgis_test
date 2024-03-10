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
import { Draw, DragBox, Select } from "ol/interaction";
import { Polygon } from "ol/geom";
import {
  click,
  shiftKeyOnly,
  platformModifierKeyOnly,
} from "ol/events/condition";
import { GeoJSON, WFS } from "ol/format";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import PrintDialog from "ol-ext/control/PrintDialog";
import { jsPDF } from "jspdf";
import CanvasAttribution from "ol-ext/control/CanvasAttribution";
import CanvasScaleLine from "ol-ext/control/CanvasScaleLine";
import CanvasTitle from "ol-ext/control/CanvasTitle";
import { Style, Text, Icon, Stroke, Fill, Image } from "ol/style";
import CircleStyle from "ol/style/Circle";
import ol_control_Legend from "ol-ext/control/Legend";
import Legend from "ol-ext/legend/Legend";
import Layer from "ol/layer/Layer";
import { WMTSCapabilities } from "ol/format";
import { optionsFromCapabilities } from "ol/source/WMTS";
import WMTS from "ol/source/WMTS";
import * as loadingstrategy from "ol/loadingstrategy";
import { saveAs } from "file-saver";

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
  visible: true,
  title: "Shksh Institucionet",
  information: "Kufiri i tokësor i republikës së Shqipërisë",
  displayInLayerSwitcher: true,
});

const shkshSherbimet = new TileLayer({
  source: new TileWMS({
    url: "http://localhost:8080/geoserver/test/wms?service=WMS",
    params: {
      LAYERS: "test:polygon",
      VERSION: "1.1.0",
    },
    // crossOrigin: "anonymous",
  }),
  visible: true,
  title: "Shksh Sherbimet",
  information: "Kufiri i tokësor i republikës së Shqipërisë",
  displayInLayerSwitcher: true,
});

// Topo layer from local geoserver
// const topo_10k = new Tile({
//   source: new TileWMS({
//     url: "http://localhost:8080/geoserver/my_workspace1/wms",
//     params: { LAYERS: "my_workspace1:10K_Topografike" },
//   }),
//   opacity: 1,
//   visible: false,
//   title: "topo 10k",
//   attributions:
//     '<a href="https://www.geoserver.org/copyright/">Geoserver contributors</a>',
// });

//Nomeklatura 5000 from ASIG Geoportal
// const nom_5000 = new TileLayer({
//   source: new TileWMS({
//     url: "https://geoportal.asig.gov.al/service/igju/wms?request=GetCapabilities",
//     params: {
//       LAYERS: "nomeklatura_5000",
//     },
//     projection: "EPSG:4326",
//   }),

//   opacity: 1,
//   visible: false,
//   title: "asigWMS",
//   attributions: '<a href="https://www.geoserver.org/copyright/">Asig</a>',
// });

// const geojson = new VectorLayer({
//   source: new VectorSource({
//     url: "data/poly.geojson",
//     format: new GeoJSON(),
//   }),
//   visible: false,
//   title: "GeoJson",
// });

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

map.addLayer(shkshInstitucionet);
map.addLayer(shkshSherbimet);

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

// fetch(
//   "http://localhost:8080/geoserver/gwc/service/wmts?REQUEST=getcapabilities"
// )
//   .then(function (response) {
//     return response.text();
//   })
//   .then(function (text) {
//     var result = wmts_parser.read(text);
//     var opt_ortho_2015_20 = optionsFromCapabilities(result, {
//       layer: "my_workspace1:ortho_farke_KRGJSH",
//       matrixSet: "EPSG:6870",
//     });

//     const wmtsFarke = new Tile({
//       name: "Ortho Farke WMTS",
//       shortName: "Farke WMTS",
//       visible: false,
//       source: new WMTS(opt_ortho_2015_20),
//     });
//     map.addLayer(wmtsFarke);
//   })
//   .catch(function (error) {});

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

//Adding Layer to the legend when page loaded
const addLayerToLegend = () => {
  layerList.forEach((layer) => {
    if (layer.getVisible()) {
      addNewItemToLegend(layer);
    }
  });
};
addLayerToLegend();

const addRemoveItemstoLegend = (layerGroup, layerTitle, layerVisibility) => {
  if (layerGroup instanceof LayerGroup) {
    const clickedLayerGroup = layerGroup.getLayers();
    const isLayerGroupVisible = layerGroup.getVisible();
    clickedLayerGroup.forEach((subLayer) => {
      const subLayerTitle = subLayer.get("title");
      const subLayerVisibility = subLayer.getVisible();
      // Check if the subLayer is in layerList
      const isSubLayerInList = layerList.includes(subLayer);
      if (isSubLayerInList) {
        const itemExists = getLegendItems.some(
          (item) => item.get("title") === subLayerTitle
        );
        if (!itemExists && isLayerGroupVisible) {
          addNewItemToLegend(subLayer);
        } else if (itemExists && !isLayerGroupVisible) {
          const itemToRemove = getLegendItems.find(
            (item) => item.get("title") === subLayerTitle
          );
          legend.removeItem(itemToRemove);
        }
      }
    });
  } else {
    const itemExists = getLegendItems.some(
      (item) => item.get("title") === layerTitle
    );
    if (!itemExists && layerVisibility) {
      addNewItemToLegend(layer);
    } else if (itemExists && !layerVisibility) {
      const itemToRemove = getLegendItems.find(
        (item) => item.get("title") === layerTitle
      );
      legend.removeItem(itemToRemove);
    }
  }
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
  addLayerToQuery();
  addRemoveItemstoLegend(clickedLayer, layerTitle, layerVisibility);
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
});
map.addControl(layerSwitcher);

// Add a legend to the print
var legendCtrl = new ol_control_Legend({
  legend: legend,
  collapsed: false,
  title: "Legend",
});
map.addControl(legendCtrl);

/* On print > save image file */
printControl.on(["print", "error"], function (e) {
  // Print success
  if (e.image) {
    if (e.pdf) {
      // Export pdf using the print info
      var pdf = new jsPDF({
        orientation: e.print.orientation,
        unit: e.print.unit,
        format: e.print.size,
      });
      pdf.addImage(
        e.image,
        "JPEG",
        e.print.position[0],
        e.print.position[0],
        e.print.imageWidth,
        e.print.imageHeight
      );

      pdf.save(e.print.legend ? "legend.pdf" : "map.pdf");
    } else {
      // Save image as file
      e.canvas.toBlob(
        function (blob) {
          var name =
            (e.print.legend ? "legend." : "map.") +
            e.imageType.replace("image/", "");
          saveAs(blob, name);
        },
        e.imageType,
        e.quality
      );
    }
  } else {
    console.warn("No canvas to export");
  }
});

//SELECT CONTROL BUTTON
const admVectorLayer = new VectorLayer({
  source: new VectorSource({
    url: "http://localhost:8080/geoserver/test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test%3Apolygon&maxFeatures=50&outputFormat=application/json",
    format: new GeoJSON(),
    attributions: "@geoserver",
  }),
  title: "Adm Vector",
  // opacity: 0,
  visible: true,
});

map.addLayer(admVectorLayer);

// const bbregdetarVectorLayer = new VectorLayer({
//   source: new VectorSource({
//     url: "http://localhost:8080/geoserver/wfs_ws/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=wfs_ws%3Abrezi_bregdetar&maxFeatures=50&outputFormat=application/json",
//     format: new GeoJSON(),
//     attributions: "@geoserver",
//   }),
//   title: "Brezi Vector",
//   opacity: 100,
//   visible: false,
// });

// const ppakVectorLayer = new VectorLayer({
//   source: new VectorSource({
//     url: "http://localhost:8080/geoserver/my_workspace1/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=my_workspace1%3APPAK_Perfitimet&maxFeatures=50&outputFormat=application/json",
//     format: new GeoJSON(),
//     attributions: "@geoserver",
//   }),
//   title: "PPAK Vector",
//   opacity: 100,
//   visible: false,
// });

// Define the URL of the WFS service
const ppakWFS =
  "http://localhost:8080/geoserver/test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test%3Apoints&outputFormat=json";

const admWFS =
  "http://localhost:8080/geoserver/test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test%3Apolygon&outputFormat=json";

async function fetchAndExtractKeys(layerURL) {
  const uniqueValuesMap = {};

  try {
    const response = await fetch(layerURL);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const features = data.features;

    features.forEach((feature) => {
      const properties = feature.properties;

      for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
          if (!uniqueValuesMap[key]) {
            uniqueValuesMap[key] = new Set();
          }
          uniqueValuesMap[key].add(properties[key]);
        }
      }
    });

    return uniqueValuesMap;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return null;
  }
}
let uniqueValuesMap;

async function getFields() {
  fieldSelect.innerHTML = "";
  attributeSelect.innerHTML = "";

  fields = [];
  const selectedLayerIndex = parseInt(layerSelect.value);

  if (selectedLayerIndex === 0) {
    uniqueValuesMap = await fetchAndExtractKeys(ppakWFS);
  } else {
    uniqueValuesMap = await fetchAndExtractKeys(admWFS);
  }

  if (uniqueValuesMap) {
    const allKeys = Object.keys(uniqueValuesMap);
    const filteredKeys = allKeys.filter((key) => key !== "geometry");

    filteredKeys.forEach((key) => {
      fields.push(key);
    });

    fields.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      fieldSelect.appendChild(option);
    });
  }
}

const layers = [shkshInstitucionet, shkshSherbimet];

// Populate the dropdown with layer names
const layerSelect = document.getElementById("layerSelect");

function addLayerToQuery() {
  layerSelect.innerHTML = "";
  layers.forEach((wmsLayer, index) => {
    if (wmsLayer.getVisible()) {
      const layerToAdd = layers[index];
      const option = document.createElement("option");
      option.value = index;
      option.text = layerToAdd.get("title");
      layerSelect.appendChild(option);
    }
  });
}

// Event listener for layer selection change
layerSelect.addEventListener("change", function () {
  getFields();
  getAttributeValues();
  updateOperatorOptions();
});

// Function to log layer attributes to the console
const fieldSelect = document.getElementById("fieldSelect");
const attributeSelect = document.getElementById("attributeSelect");
const operatorSelect = document.getElementById("operator");

operatorSelect.addEventListener("change", () => {
  const selectedField = fieldSelect.value;
  getAttributeValues(selectedField);
});

const greaterThanOption = document.querySelector('option[value=">"]');
const lessThanOption = document.querySelector('option[value="<"]');
const equalOption = document.querySelector('option[value="="]');
const likeOption = document.querySelector('option[value="LIKE"]');

async function getAttributeValues() {
  const selectedField = fieldSelect.value;
  const selectedOperator = operatorSelect.value;

  // Get the attribute input element
  const attributeInput = document.getElementById("attributeInput");
  if (attributeInput) {
    attributeInput.remove(); // Remove existing input field
  }

  if (
    selectedOperator === "LIKE" ||
    selectedOperator === ">" ||
    selectedOperator === "<"
  ) {
    // Create and display an input field for attribute value
    const input = document.createElement("input");
    input.type = "text";
    input.id = "attributeInput";
    input.placeholder = "Enter a value";
    attributeSelect.style.display = "none"; // Hide the select field
    attributeSelect.parentNode.insertBefore(input, attributeSelect); // Insert the input field
  } else {
    // Display the select field for attribute value
    attributeSelect.style.display = "block";
    attributeSelect.innerHTML = "";

    const uniqueValuesSet = uniqueValuesMap[selectedField];
    if (uniqueValuesSet) {
      const uniqueValuesArray = Array.from(uniqueValuesSet);

      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = "";
      attributeSelect.appendChild(emptyOption);

      uniqueValuesArray.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        attributeSelect.appendChild(option);
      });
    }
  }
}

// Event listener for field selection change
fieldSelect.addEventListener("change", function () {
  const selectedField = fieldSelect.value;
  getAttributeValues(selectedField);
  updateOperatorOptions();
});

const filterCQL = function () {
  const selectedLayerIndex = parseInt(layerSelect.value);
  const selectedLayer = layers[selectedLayerIndex];

  // Check if the attribute select dropdown is hidden (number field)
  const attributeInput = document.getElementById("attributeInput");
  let targetSource = selectedLayer.getSource();

  if (targetSource) {
    const params = targetSource.getParams();

    const selectedField = fieldSelect.value;
    const selectedOperator = operatorSelect.value;
    let selectedAttribute;

    if (attributeInput) {
      selectedAttribute = attributeInput.value.toUpperCase();

      const CQLFilter =
        selectedField +
        " " +
        selectedOperator +
        " '" +
        selectedAttribute +
        "%'";

      params.CQL_FILTER = CQLFilter;
    } else {
      selectedAttribute = attributeSelect.value;

      const CQLFilter =
        selectedField + " " + selectedOperator + " '" + selectedAttribute + "'";

      params.CQL_FILTER = CQLFilter;
    }
    targetSource.updateParams(params);
  }
};

// Function to check if a field's attributes are numeric
function areAttributesNumeric(selectedField) {
  if (!selectedField || !uniqueValuesMap[selectedField]) {
    return false;
  }
  const uniqueValuesSet = uniqueValuesMap[selectedField];
  for (const value of uniqueValuesSet) {
    if (isNaN(parseFloat(value))) {
      return false;
    }
  }
  return true;
}

// Update operator options based on selected field
function updateOperatorOptions() {
  const selectedField = fieldSelect.value;
  greaterThanOption.disabled = !areAttributesNumeric(selectedField);
  lessThanOption.disabled = !areAttributesNumeric(selectedField);
  likeOption.disabled = areAttributesNumeric(selectedField);
}

// Event listener for field selection change
fieldSelect.addEventListener("change", function () {
  updateOperatorOptions();
  getAttributeValues();
});

const selectControlBtn = document.querySelector("#selectControlButton");
const selectControlForm = document.querySelector(".selectControl");

selectControlBtn.addEventListener("click", () => {
  selectControlForm.hidden = !selectControlForm.hidden;
  addLayerToQuery();
  getFields();
});

const sumbmitBtn = document.getElementById("sumbmitBtn");

sumbmitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  filterCQL();
});
//DRAW INTERACTION
// Create a vector source and layer for the drawn features
const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
  displayInLayerSwitcher: false,
});
map.addLayer(vectorLayer);

const selectBtn = document.getElementById("selectByPolygon");
const drawPolygon = document.getElementById("drawPolygon");
let select, draw, listener, sketch;

selectBtn.addEventListener("click", (e) => {
  // Select  interaction
  select = new Select({});
  map.addInteraction(select);
  const selectedFeatures = select.getFeatures();
  // console.log(selectedFeatures);

  // select.on("select", (e) => {
  //   console.log(e.selected[0].values_);
  // });

  // Drawing interaction
  draw = new Draw({
    source: vectorSource,
    type: "Polygon",
    //only draw when Ctrl is pressed.
    condition: platformModifierKeyOnly,
  });
  map.addInteraction(draw);

  draw.on(
    "drawstart",
    function (event) {
      vectorSource.clear();
      //selectedFeatures.clear();
      select.setActive(false);

      sketch = event.feature;
      const polygon = sketch.getGeometry();
      listener = sketch.getGeometry().on("change", function (event) {
        selectedFeatures.clear();
        var polygon = event.target;

        const polygonCoords = polygon.getCoordinates();
        const newPolygon = new Polygon(polygonCoords);

        var features = admVectorLayer.getSource().getFeatures();

        for (var i = 0; i < features.length; i++) {
          const featureToCHeck = features[i]
            .getGeometry()
            .getCoordinates()[0][0];

          const doesAnyCoordinateIntersect = featureToCHeck.some((coord) => {
            return newPolygon.intersectsCoordinate(coord);
          });
          if (doesAnyCoordinateIntersect) {
            selectedFeatures.push(features[i]);
          }
        }
      });
    },
    this
  );

  /* Reactivate select after 300ms (to avoid single click trigger)
	and create final set of selected features. */
  draw.on("drawend", function (event) {
    sketch = null;
    delaySelectActivate();
    selectedFeatures.clear();

    var polygon = event.feature.getGeometry();

    const polygonCoords = polygon.getCoordinates();
    const newPolygon = new Polygon(polygonCoords);
    var features = admVectorLayer.getSource().getFeatures();

    for (var i = 0; i < features.length; i++) {
      const featureToCHeck = features[i].getGeometry().getCoordinates()[0][0];

      const doesAnyCoordinateIntersect = featureToCHeck.some((coord) => {
        return newPolygon.intersectsCoordinate(coord);
      });
      if (doesAnyCoordinateIntersect) {
        selectedFeatures.push(features[i]);
      }
    }
    const selectedFeaturesArray = selectedFeatures.getArray();
    selectedFeaturesArray.forEach((feature) => {
      console.log(feature.values_);
    });
  });
});

function delaySelectActivate() {
  setTimeout(function () {
    select.setActive(true);
  }, 300);
}
